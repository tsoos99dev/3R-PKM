/* 
 * File:   stepper.h
 * Author: tamas
 *
 * Created on October 21, 2022, 7:56 PM
 */

#ifndef STEPPER_H
#define	STEPPER_H

#ifdef	__cplusplus
extern "C" {
#endif

 
#define STEPS_PER_REVOLUTION = 2048
    

void stepperInitialise(void);


#ifdef	__cplusplus
}
#endif

#endif	/* STEPPER_H */

