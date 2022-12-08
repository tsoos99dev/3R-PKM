#include <avr/interrupt.h>
#include "general.h"
#include "USI_UART.h"
#include "shift_register.h"
#include "robot.h"

volatile RobotState robotState = READY;

unsigned char maxSpeed = 0;

MotorPos motorPos = {0, 0 ,0};
MotorPos motorPosBuffer[64];
unsigned char motorPosHead = 0;
unsigned char motorPosTail = 0;

unsigned char step_seq[] = {
    ((0 << STEP_A0) | (0 << STEP_A1) | (1 << STEP_B0) | (1 << STEP_B1)),
    ((0 << STEP_A0) | (0 << STEP_A1) | (1 << STEP_B0) | (0 << STEP_B1)),
    ((0 << STEP_A0) | (1 << STEP_A1) | (1 << STEP_B0) | (0 << STEP_B1)),
    ((0 << STEP_A0) | (1 << STEP_A1) | (0 << STEP_B0) | (0 << STEP_B1)),
    ((1 << STEP_A0) | (1 << STEP_A1) | (0 << STEP_B0) | (0 << STEP_B1)),
    ((1 << STEP_A0) | (0 << STEP_A1) | (0 << STEP_B0) | (0 << STEP_B1)),
    ((1 << STEP_A0) | (0 << STEP_A1) | (0 << STEP_B0) | (1 << STEP_B1)),
    ((0 << STEP_A0) | (0 << STEP_A1) | (0 << STEP_B0) | (1 << STEP_B1))
};

StepperState steppers[STEPPER_NUM];

void stepperInit(void) {
    for(unsigned char i = 0; i < STEPPER_NUM; i += 1) {
        steppers[i].position = 0;
        steppers[i].target = 0;
        steppers[i].disabled = TRUE;
    }
}

void robotInit() {
    shiftRegisterInit();
    shiftRegisterOutputEnable();
    
    motorPosHead = 0;
    motorPosTail = 0;
    maxSpeed = 0;
    
    TCNT1   = 0;                            
    OCR1A   = 0;
    TCCR1A  = 0;                                                                // Timer1 in CTC mode
    TCCR1B  = (0<<WGM13)|(1<<WGM12)|(1<<CS12)|(0<<CS11)|(1<<CS10);              // Reset the pre-scaler and start Timer1.
    TIFR1   = (1<<OCF1A);                                                       // Clear Timer1 Compare Match A interrupt flag.
    TIMSK1 |= (1<<OCIE1A);
}


// Try to recover from a buffer overflow or other error
void resetRobot() {
    if(robotState == CALIBRATING) return;
    USI_UART_FlushBuffers();
    robotInit();
    robotState = READY;
}


void sendStatus() {
    USI_UART_TransmitByte(motorPos.q1);
    USI_UART_TransmitByte(motorPos.q2);
    USI_UART_TransmitByte(motorPos.q3);
    USI_UART_TransmitByte(robotState);
    USI_UART_TransmitByte('\n');
}


void setMaxSpeed(unsigned char s) {
    if(robotState == ERROR || robotState == CALIBRATING) return;
    maxSpeed = s;
}


void setPosition(unsigned char q1, unsigned char q2, unsigned char q3) {
    if(robotState == ERROR || robotState == CALIBRATING) return;
    unsigned char tmphead = (motorPosHead + 1) & MOTOR_POS_BUFFER_MASK;         // Calculate buffer index.
    while (tmphead == motorPosTail);                                            // Wait for free space in buffer.
    MotorPos newPos = {q1, q2, q3};
    motorPosBuffer[tmphead] = newPos;                                           // Store data in buffer.
    motorPosHead = tmphead;     
}


unsigned char motorPosInBuffer() {
    return (motorPosHead != motorPosTail);
}


// Move each motor to its limit and set position offsets
void calibrate() {
    if(robotState == ERROR) return;
    robotState = CALIBRATING;
}


// Send robot to origin and reset position buffer
void home() {
    if(robotState == ERROR || robotState == CALIBRATING) return;
    
    motorPosHead = 0;
    motorPosTail = 0;
    
    setPosition(0, 0, 0);
}


ISR(TIM1_COMPA_vect, ISR_BLOCK) {
    OCR1A = 23;  // Calculate delay based on max speed
    
    if(USI_UART_GetStatus().Reception_Buffer_Overflow) {
        robotState = ERROR;
    }
    
    // Move each motor to its limit and set position offsets
    if(robotState == CALIBRATING) {
        robotState = READY;
        return;
    }
    
    if(!motorPosInBuffer()) return;
}