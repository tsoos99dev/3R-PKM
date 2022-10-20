import React, { useCallback, useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-native-use-websocket';


enum RobotState {
    UNKNOWN = 0,
    READY = 1,
    CALIBRATING = 2,
    EXECUTING = 3,
    ERROR = 4
};

export declare type RobotPosition = {x: number, y: number, theta: number}; 

const robotSocketUrl = 'ws://192.168.4.1:81';

export const useRobot = () => {
    const [shouldConnect, setShouldConnect] = useState(false);
    const [position, setPosition] = useState<RobotPosition | null>(null);
    const [maxSpeed, setMaxSpeed] = useState<number | null>(null);
    const [robotState, setRobotState] = useState(RobotState.UNKNOWN);

    const {
        sendMessage, 
        sendJsonMessage,
        lastMessage, 
        lastJsonMessage,
        readyState,
    } = useWebSocket(robotSocketUrl, {
        onError: (error) => {
            console.log(error);
        },
        onClose: (event) => {
            console.log(event);
            setShouldConnect(false);
        },
        share: true
    }, shouldConnect);

    useEffect(() => {
        const { maxSpeed, position, status } = lastJsonMessage;

        if(maxSpeed === undefined || position === undefined || status === undefined) return;

        console.log(lastJsonMessage);
        setMaxSpeed(maxSpeed);
        setPosition(position);
        setRobotState(status);
    }, [lastJsonMessage]);

    const connectHandler = useCallback(() => {
        setShouldConnect(true);
    }, []);

    const disconnectHandler = useCallback(() => {
        setShouldConnect(false);
    }, []);

    const setTargetPositionHandler = useCallback((newPosition: RobotPosition) => {
        sendJsonMessage({
            type: "setPosition",
            position: newPosition
        });
    }, []);

    const setMaxSpeedHandler = useCallback((newSpeed: number) => {
        sendJsonMessage({
            type: "setSpeed",
            maxSpeed: newSpeed
        });
    }, []);

    const homeHandler = useCallback(() => {
        sendJsonMessage({
            type: 'home'
        })
    }, []);

    const calibrateHandler = useCallback(() => {
        sendJsonMessage({
            type: "calibrate"
        });
    }, []);
    
    return {
        isConnecting: (readyState === ReadyState.CONNECTING),
        isConnected: (readyState === ReadyState.OPEN),
        isStarting: (robotState === RobotState.UNKNOWN),
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
        disconnect: disconnectHandler,
        home: homeHandler,
        calibrate: calibrateHandler
    };
};