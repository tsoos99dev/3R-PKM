#include "shift_register.h"


void shiftRegisterInit(void) {
    OE_PORT    &= ~(1 << OE_BIT);
    OE_DDR     |=  (1 << OE_BIT);
    
    RCLK_PORT  &= ~(1 << RCLK_BIT);
    RCLK_DDR   |=  (1 << RCLK_BIT);
    
    SRCLR_PORT &= ~(1 << SRCLR_BIT);
    SRCLR_DDR  |=  (1 << SRCLR_BIT);
    SRCLR_PORT |=  (1 << SRCLR_BIT);
    
    SRCLK_PORT &= ~(1 << SRCLK_BIT);
    SRCLK_DDR  |=  (1 << SRCLK_BIT);
    
    SER_PORT   &= ~(1 << SER_BIT);
    SER_DDR    |=  (1 << SER_BIT);
}

void shiftRegisterClear(void) {
    SRCLR_PORT &= ~(1 << SRCLR_BIT);
    SRCLR_PORT |=  (1 << SRCLR_BIT);
}

void shiftRegisterOutputEnable(void) {
    OE_PORT |= (1 << OE_BIT);
}

void shiftRegisterOutputDisable(void) {
    OE_PORT &= ~(1 << OE_BIT);
}

void shiftRegisterUpdateStorage(void) {
    RCLK_PORT |=  (1 << RCLK_BIT);
    RCLK_PORT &= ~(1 << RCLK_BIT);
}

void shiftRegisterPushBit(unsigned char value) {
    SER_PORT = (SER_PORT & ~(1 << SER_BIT)) | (value << SER_BIT);
    SRCLK_PORT |=  (1 << RCLK_BIT);
    SRCLK_PORT &= ~(1 << RCLK_BIT);
}

void shiftRegisterPushByte(unsigned char data) {
    for(unsigned char i = 0; i < 8; i += 1) {
        shiftRegisterPushBit(1 & (data >> i));
    }
}
