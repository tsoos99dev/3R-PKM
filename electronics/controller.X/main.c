/*
 * File:   main.c
 * Author: tamas
 *
 * Created on October 16, 2022, 8:35 PM
 */


#include <avr/io.h>
#include <avr/interrupt.h>

#define F_CPU 8000000L
#include <util/delay.h>

#include "USI_UART.h"


#define RX_BUFFER_SIZE 8
#define RX_BUFFER_MASK (RX_BUFFER_SIZE - 1)


unsigned char RX_Buf[RX_BUFFER_SIZE];


int main(void) {
    USI_UART_FlushBuffers();
    USI_UART_InitialiseReceiver();
    
    sei();
    
    while(1) 
    {   
        if(USI_UART_GetStatus().Reception_Buffer_Overflow) {
            DDRB |= (1<<PB0);
            PORTB ^= (1<<PB0);
            USI_UART_FlushBuffers();
        }
        
        if(USI_UART_PeekAtLastByte() == '\n') 
        {
            while(USI_UART_DataInReceiveBuffer())
            {
                USI_UART_TransmitByte(USI_UART_ReceiveByte());            
            }
        }
    }
}

