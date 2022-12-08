/* 
 * File:   robot.h
 * Author: tamas
 *
 * Created on October 21, 2022, 7:56 PM
 */

#ifndef ROBOT_H
#define	ROBOT_H

#ifdef	__cplusplus
extern "C" {
#endif
    
#define STEP_A0 3
#define STEP_A1 2
#define STEP_B0 1
#define STEP_B1 0

#define STEPPER_NUM 3

#define HALF_STEP FALSE

#if HALF_STEP
    #define STEP_INCREMENT 1
#else 
    #define STEP_INCREMENT 2
#endif
 
#define STEPS_PER_REVOLUTION = 2048
    
#define MOTOR_POS_BUFFER_SIZE 64
#define MOTOR_POS_BUFFER_MASK (MOTOR_POS_BUFFER_SIZE - 1)
#if (MOTOR_POS_BUFFER_SIZE & MOTOR_POS_BUFFER_MASK)
    #error TX buffer size is not a power of 2
#endif


typedef struct {
    unsigned int position;
    unsigned int target;
    unsigned char disabled;
} StepperState;


typedef enum {
    READY,
    EXECUTING,
    CALIBRATING,
    ERROR
} RobotState;


typedef struct {
    unsigned char q1;
    unsigned char q2;
    unsigned char q3;
} MotorPos;
    

//void stepperInit(void);
void robotInit();
void resetRobot();
void sendStatus();
void setMaxSpeed(unsigned char s);
void setPosition(unsigned char q1, unsigned char q2, unsigned char q3);
//unsigned char motorPosInBuffer();
void calibrate();
void home();


#ifdef	__cplusplus
}
#endif

#endif	/* ROBOT_H */

