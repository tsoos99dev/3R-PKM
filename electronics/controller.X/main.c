/*
 * File:   main.c
 * Author: tamas
 *
 * Created on October 13, 2022, 5:08 PM
 */


#include <avr/io.h>
#include "usi.h"

int main(void) {
    int x = APPLE;
    
    while (1) {
        x = x + 1;
    }
}
