#include <avr/interrupt.h>
#include "general.h"
#include "shift_register.h"
#include "serial_stepper.h"

#define STEP_A0 3
#define STEP_A1 2
#define STEP_B0 1
#define STEP_B1 0

#define STEPPER_NUM 1

#define HALF_STEP FALSE

#if HALF_STEP
    #define STEP_INCREMENT 1
#else 
    #define STEP_INCREMENT 2

typedef struct {
    unsigned int position;
    unsigned int target;
    unsigned char disabled;
} StepperState;


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

unsigned char maxSpeed = 0;
StepperState steppers[STEPPER_NUM];

void stepperInit(void) {
    shiftRegisterInit();
    shiftRegisterOutputEnable();
    
    for(unsigned char i = 0; i < STEPPER_NUM; i += 1) {
        steppers[i].position = 0;
        steppers[i].target = 0;
        steppers[i].disabled = TRUE;
    }
}


ISR(TIM1_COMPA_vect, ISR_BLOCK) {
}