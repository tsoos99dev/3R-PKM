#include <avr/io.h>
#include <avr/interrupt.h>
#include "general.h"
#include "USI_UART.h"


//********** USI UART Defines **********//

#define DATA_BITS                 8
#define START_BIT                 1
#define STOP_BIT                  1
#define HALF_FRAME                5

#define USI_COUNTER_MAX_COUNT     16
#define USI_COUNTER_SEED_TRANSMIT (USI_COUNTER_MAX_COUNT - HALF_FRAME)
#define INTERRUPT_STARTUP_DELAY   (0x30 / TIMER_PRESCALER)
#define CLOCKS_PER_BIT            ((SYSTEM_CLOCK / BAUDRATE) / TIMER_PRESCALER)
#define TIMER0_TOP                CLOCKS_PER_BIT

#if (TIMER_PRESCALER == 1)
    #define TIMER0_CS ((0<<CS02)|(0<<CS01)|(1<<CS00))
#else
    #define TIMER0_CS ((0<<CS02)|(1<<CS01)|(0<<CS00))
#endif

#if ((CLOCKS_PER_BIT * 3/2) + INTERRUPT_STARTUP_DELAY > 256)
    #define INITIAL_TIMER0_TOP        ((CLOCKS_PER_BIT * 1/2) - INTERRUPT_STARTUP_DELAY)
    #define USI_COUNTER_SEED_RECEIVE  (USI_COUNTER_MAX_COUNT - (START_BIT + DATA_BITS))
#else
    #define INITIAL_TIMER0_TOP        ((CLOCKS_PER_BIT * 3/2) - INTERRUPT_STARTUP_DELAY)
    #define USI_COUNTER_SEED_RECEIVE  (USI_COUNTER_MAX_COUNT - DATA_BITS)
#endif

#define UART_RX_BUFFER_MASK (UART_RX_BUFFER_SIZE - 1)
#if (UART_RX_BUFFER_SIZE & UART_RX_BUFFER_MASK)
    #error RX buffer size is not a power of 2
#endif

#define UART_TX_BUFFER_MASK (UART_TX_BUFFER_SIZE - 1)
#if (UART_TX_BUFFER_SIZE & UART_TX_BUFFER_MASK)
    #error TX buffer size is not a power of 2
#endif

//********** Static Variables **********//

register unsigned char USI_UART_TxData asm("r15");       // Tells the compiler to store the byte to be transmitted in registry.

unsigned char          UART_RxBuf[UART_RX_BUFFER_SIZE];  // UART buffers. Size is definable in the header file.
volatile unsigned char UART_RxHead;
volatile unsigned char UART_RxTail;

unsigned char          UART_TxBuf[UART_TX_BUFFER_SIZE];
volatile unsigned char UART_TxHead;
volatile unsigned char UART_TxTail;

volatile USI_UART_Status USI_UART_status = {0};


//********** USI_UART functions **********//

// Reverses the order of bits in a byte.
// I.e. MSB is swapped with LSB, etc.
unsigned char bitReverse(unsigned char x)
{
    x = ((x >> 1) & 0x55) | ((x << 1) & 0xaa);
    x = ((x >> 2) & 0x33) | ((x << 2) & 0xcc);
    x = ((x >> 4) & 0x0f) | ((x << 4) & 0xf0);
    return x;    
}

void USI_UART_FlushBuffers(void)  
{  
    UART_RxTail = 0;
    UART_RxHead = 0;
    UART_TxTail = 0;
    UART_TxHead = 0;
    
    USI_UART_status.Reception_Buffer_Overflow = FALSE;
}

// Initialize USI for UART transmission.
void USI_UART_InitialiseTransmitter(void)                              
{   
    TCCR0B  = 0;                                               // Stop Timer0
    USIDR   = 0xFF;                                            // Make sure MSB is '1' before enabling USI_DO.
    DO_DDR |= 1<<DO_BIT;                                       // Configure USI_DO as output.      
    
    USISR   = (1<<USISIF)|(1<<USIOIF)|(1<<USIPF)|              // Clear all USI interrupt flags.
               0x0F;                                           // Pre-load the USI counter to generate interrupt at first USI clock.
    
    USICR   = (0<<USISIE)|(1<<USIOIE)|                         // Enable USI Counter OVF interrupt.
              (0<<USIWM1)|(1<<USIWM0)|                         // Select Three Wire mode.
              (0<<USICS1)|(1<<USICS0)|(0<<USICLK);             // Select Timer0 CMP A Match as USI Clock source. 
    
    TCNT0   = 0;
    OCR0A   = TIMER0_TOP;
    TCCR0A  = (1<<WGM01)|(0<<WGM00);                           // Timer0 in CTC mode
    TCCR0B  = TIMER0_CS;                                       // Reset the pre-scaler and start Timer0.
    TIFR0  |= (1<<OCF0A);                                      // Clear Timer0 Compare Match A interrupt flag.
    TIMSK0 |= (1<<OCIE0A);                                     // Enable Timer0 Compare Match A interrupt.
                  
    USI_UART_status.Ongoing_Transmission_From_Buffer = TRUE;
}

// Initialize USI for UART reception.
// Note that this function only enables pin change interrupt on the USI Data Input pin.
// The USI is configured to read data within the pin change interrupt.
void USI_UART_InitialiseReceiver(void)        
{  
    TCCR0B     =   0;                                          // Stop Timer0.
    USICR      =   0;                                          // Disable USI.
    DI_DDR    &= ~(1<<DI_BIT);                                 // Set USI DI, DO and SCK pins as inputs.  
    DO_DDR    &= ~(1<<DO_BIT);
    USCK_DDR  &= ~(1<<USCK_BIT);       
    DI_PORT   |=  (1<<DI_BIT);                                 // Enable pull up on USI DO, DI and SCK pins.
    DO_PORT   |=  (1<<DO_BIT);
    USCK_PORT |=  (1<<USCK_BIT);
    GIFR      |=  (1<<PCIF0);                                  // Clear pin change interrupt flag.
    GIMSK     |=  (1<<PCIE0);                                  // Enable pin change interrupts
    PCMSK0    |=  (1<<DI_BIT);                                 // Enable pin change interrupt on DI
}

// Puts data in the transmission buffer, after reversing the bits in the byte.
// Initiates the transmission routines if not already started.
void USI_UART_TransmitByte(unsigned char data)          
{
    unsigned char tmphead;
    tmphead = (UART_TxHead + 1) & UART_TX_BUFFER_MASK;              // Calculate buffer index.
    while (tmphead == UART_TxTail);                                 // Wait for free space in buffer.
    UART_TxBuf[tmphead] = bitReverse(data);                         // Reverse the order of the bits in the data byte and store data in buffer.
    UART_TxHead = tmphead;                                          // Store new index.
    
    if(USI_UART_status.Ongoing_Transmission_From_Buffer) return;    // Start transmission from buffer (if not already started).
    
    while(USI_UART_status.Ongoing_Reception_Of_Package);            // Wait for USI to finish reading incoming data.

    USI_UART_InitialiseTransmitter();              
}

// Returns a byte from the receive buffer. Waits if buffer is empty.
unsigned char USI_UART_ReceiveByte(void)                
{
    while(UART_RxHead == UART_RxTail);                      // Wait for incoming data 
    unsigned char tmptail = (UART_RxTail + 1) & UART_RX_BUFFER_MASK;    // Calculate buffer index 
    UART_RxTail = tmptail;                                  // Store new index 
    return bitReverse(UART_RxBuf[tmptail]);                 // Reverse the order of the bits in the data byte before it returns data from the buffer.
}

// Check if there is data in the receive buffer.
unsigned char USI_UART_DataInReceiveBuffer(void)        
{
    return (UART_RxHead != UART_RxTail);                    // Return 0 (FALSE) if the receive buffer is empty.
}

// Check last byte
unsigned char USI_UART_PeekAtLastByte(void)                
{
    while(UART_RxHead == UART_RxTail);                      // Wait for incoming data 
    return bitReverse(UART_RxBuf[UART_RxHead]);             // Reverse the order of the bits in the data byte before it returns data from the buffer.
}

USI_UART_Status USI_UART_GetStatus(void)                
{
    return USI_UART_status;
}


// ********** Interrupt Handlers ********** //

// The pin change interrupt is used to detect USI_UART reception.
// It is here the USI is configured to sample the UART signal.                                     
ISR(PCINT0_vect, ISR_BLOCK)                                
{
    if (DI_PIN & 1<<DI_BIT) return;                           // Return if DI is high
    
    GIMSK &= ~(1<<PCIE0);                                     // Disable pin change interrupts
                                                          
    TCNT0   = 0;                            
    OCR0A   = INITIAL_TIMER0_TOP;
    TCCR0A  = (1<<WGM01)|(0<<WGM00);                          // Timer0 in CTC mode
    TCCR0B  = TIMER0_CS;                                      // Reset the pre-scaler and start Timer0.
    TIFR0   = (1<<OCF0A);                                     // Clear Timer0 Compare Match A interrupt flag.
    TIMSK0 |= (1<<OCIE0A);                                    // Enable Timer0 Compare Match A interrupt.
    
    USISR  = 0xF0 |                                           // Clear all USI interrupt flags.
             USI_COUNTER_SEED_RECEIVE;                        // Pre-load the USI counter to generate interrupt.
    
    USICR  = (0<<USISIE)|(1<<USIOIE)|                         // Enable USI Counter OVF interrupt.
             (0<<USIWM1)|(1<<USIWM0)|                         // Select Three Wire mode.
             (0<<USICS1)|(1<<USICS0)|(0<<USICLK)|             // Select Timer0 CMP A Match as USI Clock source.
             (0<<USITC);                                           
                                                              // Note that enabling the USI will also disable the pin change interrupt.
    
    USI_UART_status.Ongoing_Reception_Of_Package = TRUE;
}

// The USI Counter Overflow interrupt is used for moving data between memory and the USI data register.
// The interrupt is used for both transmission and reception.                                        
ISR(USI_OVF_vect, ISR_BLOCK)                            
{   
    // Check if we are running in receive mode.
    if(!USI_UART_status.Ongoing_Transmission_From_Buffer)      
    {           
        USI_UART_status.Ongoing_Reception_Of_Package = FALSE;  
        
        unsigned char tmphead;
        tmphead = (UART_RxHead + 1) & UART_RX_BUFFER_MASK;              // Calculate buffer index.

        if (tmphead == UART_RxTail)                                     // If buffer is full trash data and set buffer full flag.
        {
            USI_UART_status.Reception_Buffer_Overflow = TRUE;           // Store status to take actions elsewhere in the application code
        }
        else                                                            // If there is space in the buffer then store the data.
        {
            UART_RxHead = tmphead;                                      // Store new index.
            UART_RxBuf[tmphead] = USIDR;                                // Store received data in buffer. Note that the data must be bit reversed before used. 
        }                                                               // The bit reversing is moved to the application section to save time within the interrupt.

        USI_UART_InitialiseReceiver();
        
        return;
    }
    
    // Else running in transmit mode.
    // If ongoing transmission, then send second half of transmit data.
    if(USI_UART_status.Ongoing_Transmission_Of_Package)   
    {                                   
        USI_UART_status.Ongoing_Transmission_Of_Package = FALSE;    // Clear on-going package transmission flag.

        USISR = 0xF0 | (USI_COUNTER_SEED_TRANSMIT);                 // Load USI Counter seed and clear all USI flags.
        USIDR = (USI_UART_TxData << 3) | 0x07;                      // Reload the USIDR with the rest of the data and a stop-bit.

        return;
    }
    
    // Else start sending more data or leave transmit mode.
    // If there is no data in the transmit buffer enter receive mode
    if (UART_TxHead == UART_TxTail)                           
    {
        USI_UART_status.Ongoing_Transmission_From_Buffer = FALSE; 
        USI_UART_InitialiseReceiver();
        
        return;
    }
    
    // Else send first half of data.
    USI_UART_status.Ongoing_Transmission_Of_Package = TRUE; // Set on-going package transmission flag.

    unsigned char tmptail;
    tmptail = (UART_TxTail + 1) & UART_TX_BUFFER_MASK;      // Calculate buffer index.
    UART_TxTail = tmptail;                                  // Store new index.            
    USI_UART_TxData = UART_TxBuf[tmptail];                  // Read out the data that is to be sent. Note that the data must be bit reversed before sent.
                                                            // The bit reversing is moved to the application section to save time within the interrupt.
    USISR  = 0xF0 | (USI_COUNTER_SEED_TRANSMIT);            // Load USI Counter seed and clear all USI flags.
    USIDR  = (USI_UART_TxData >> 2) | 0x80;                 // Copy (initial high state,) start-bit and 6 LSB of original data (6 MSB
                                                            //  of bit of bit reversed data). 
}


ISR(TIM0_COMPA_vect, ISR_BLOCK) {
    OCR0A  = TIMER0_TOP;
}