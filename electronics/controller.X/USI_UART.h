/* 
 * File:   USI_UART.h
 * Author: tamas
 *
 * Created on October 16, 2022, 8:52 PM
 */

#ifndef USI_UART_H
#define	USI_UART_H

#ifdef	__cplusplus
extern "C" {
#endif


    //********** USI UART Defines **********//

//#define SYSTEM_CLOCK             14745600
//#define SYSTEM_CLOCK             11059200
#define SYSTEM_CLOCK              8000000
//#define SYSTEM_CLOCK              7372800
//#define SYSTEM_CLOCK              3686400
//#define SYSTEM_CLOCK              2000000
//#define SYSTEM_CLOCK              1843200
//#define SYSTEM_CLOCK              1000000

//#define BAUDRATE                   115200
//#define BAUDRATE                    57600
//#define BAUDRATE                    28800
//#define BAUDRATE                    19200
//#define BAUDRATE                    14400
#define BAUDRATE                     9600

//#define TIMER_PRESCALER           1
#define TIMER_PRESCALER           8     

#define UART_RX_BUFFER_SIZE        8     /* 2,4,8,16,32,64,128 or 256 bytes */
#define UART_TX_BUFFER_SIZE        8


typedef union                           // Status byte holding flags.
{
    unsigned char status;
    struct
    {
        unsigned char Ongoing_Transmission_From_Buffer:1;
        unsigned char Ongoing_Transmission_Of_Package:1;
        unsigned char Ongoing_Reception_Of_Package:1;
        unsigned char Reception_Buffer_Overflow:1;
        unsigned char flag4:1;
        unsigned char flag5:1;
        unsigned char flag6:1;
        unsigned char flag7:1;
    };
} USI_UART_Status;

//********** USI_UART Prototypes **********//

unsigned char bitReverse(unsigned char);
void          USI_UART_FlushBuffers(void);
void          USI_UART_InitialiseReceiver(void);
void          USI_UART_InitialiseTransmitter(void);
void          USI_UART_TransmitByte(unsigned char);
unsigned char USI_UART_ReceiveByte(void);
unsigned char USI_UART_DataInReceiveBuffer(void);
unsigned char USI_UART_PeekAtLastByte(void);
USI_UART_Status USI_UART_GetStatus(void);


#ifdef	__cplusplus
}
#endif

#endif	/* USI_UART_H */

