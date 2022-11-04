/*
 * File:   main.c
 * Author: tamas
 *
 * Created on October 16, 2022, 8:35 PM
 */


#include <avr/io.h>
#include <avr/interrupt.h>

#include "USI_UART.h"
#include "robot.h"


void parseCommand() {
    if(USI_UART_PeekAtLastByte() == '\n') {
        unsigned char command = USI_UART_ReceiveByte();
        unsigned char q1, q2, q3;
        unsigned char maxSpeed;
        
        switch(command) {
            case 'r':
                resetRobot();
                break;
            case 's':
                sendStatus();
                break;
            case 'c':
                calibrate();
                break;
            case 'h':
                home();
                break;
            case 'p':
                q1 = USI_UART_ReceiveByte();
                q2 = USI_UART_ReceiveByte();
                q3 = USI_UART_ReceiveByte();
                setPosition(q1, q2, q3);
                break;
            case 'm':
                maxSpeed = USI_UART_ReceiveByte();
                setMaxSpeed(maxSpeed);
                break;
        }
        
        USI_UART_ReceiveByte(); // Pop EOL
    }
}


int main(void) {
    USI_UART_FlushBuffers();
    USI_UART_InitialiseReceiver();
    
    robotInit();
    calibrate();
    
    while(1) 
    {   
        parseCommand();
    }
}
