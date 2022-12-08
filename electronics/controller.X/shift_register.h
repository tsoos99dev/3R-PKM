/* 
 * File:   shift_register.h
 * Author: tamas
 *
 * Created on October 23, 2022, 4:45 PM
 */

#ifndef SHIFT_REGISTER_H
#define	SHIFT_REGISTER_H

#ifdef	__cplusplus
extern "C" {
#endif
    

#include <avr/io.h>


#define OE_DDR DDRA
#define OE_PORT PORTA
#define OE_BIT 0

#define RCLK_DDR DDRA
#define RCLK_PORT PORTA
#define RCLK_BIT 0

#define SRCLR_DDR DDRA
#define SRCLR_PORT PORTA
#define SRCLR_BIT 0

#define SRCLK_DDR DDRA
#define SRCLK_PORT PORTA
#define SRCLK_BIT 0

#define SER_DDR DDRA
#define SER_PORT PORTA
#define SER_BIT 0
    
    
void shiftRegisterInit(void);
void shiftRegisterClear(void);
void shiftRegisterOutputEnable(void);
void shiftRegisterOutputDisable(void);
void shiftRegisterUpdateStorage(void);
void shiftRegisterPushBit(unsigned char value);
void shiftRegisterPushByte(unsigned char data);


#ifdef	__cplusplus
}
#endif

#endif	/* SHIFT_REGISTER_H */

