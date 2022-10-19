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

    const setCurrentPositionHandler = useCallback((newPosition: RobotPosition) => {
        setPosition(newPosition);
    }, []);
    
    return {
        isConnecting: (readyState === ReadyState.CONNECTING),
        isConnected: (readyState === ReadyState.CLOSED),
        isBusy: (robotState === RobotState.CALIBRATING || robotState === RobotState.EXECUTING),
        isError: (robotState === RobotState.ERROR),
        isCalibrating: (robotState === RobotState.CALIBRATING),
        isReady: (robotState === RobotState.READY),
        isExecuting: (robotState === RobotState.EXECUTING),
        currentPosition: position,
        setCurrentPosition: setCurrentPositionHandler,
        connect: connectHandler
    };
};