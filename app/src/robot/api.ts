import React, { useCallback, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-native-use-websocket';


enum RobotState {
    UNKNOWN = 0,
    READY = 1,
    CALIBRATING = 2,
    EXECUTING = 3,
    ERROR = 4
};

export declare type RobotPosition = {x: number, y: number, theta: number}; 

const robotSocketUrl = 'wss://echo.websocket.org';

export const useRobot = () => {
    const [shouldConnect, setShouldConnect] = useState(false);
    const [position, setPosition] = useState({x: 0, y: 0, theta: 0});
    const [maxSpeed, setMaxSpeed] = useState(5);
    const [robotState, setRobotState] = useState(RobotState.UNKNOWN);

    const {
        sendMessage, 
        lastMessage, 
        readyState
    } = useWebSocket(robotSocketUrl, {
        onError: (error) => {

        },
        onClose: (event) => {
            setShouldConnect(false);
        },
        share: true
    }, shouldConnect);

    const connectHandler = useCallback(() => {
        setShouldConnect(true);
    }, []);

    const setTargetPositionHandler = useCallback((newPosition: RobotPosition) => {
        console.log(newPosition);
        setPosition(newPosition);
    }, []);

    const setMaxSpeedHandler = useCallback((newSpeed: number) => {
        console.log(newSpeed);
        setMaxSpeed(newSpeed);
    }, []);

    const homeHandler = useCallback(() => {
        console.log('Home');
    }, []);

    const calibrateHandler = useCallback(() => {
        console.log('Calibrate');
    }, []);
    
    return {
        isConnecting: (readyState === ReadyState.CONNECTING),
        isConnected: (readyState === ReadyState.CLOSED),
        isBusy: (robotState === RobotState.CALIBRATING || robotState === RobotState.EXECUTING),
        isError: (robotState === RobotState.ERROR),
        isCalibrating: (robotState === RobotState.CALIBRATING),
        isReady: (robotState === RobotState.READY),
        isExecuting: (robotState === RobotState.EXECUTING),
        position: position,
        maxSpeed: maxSpeed,
        setTargetPosition: setTargetPositionHandler,
        setMaxSpeed: setMaxSpeedHandler,
        connect: connectHandler,
        home: homeHandler,
        calibrate: calibrateHandler
    };
};