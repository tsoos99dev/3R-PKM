import React, { useCallback, useEffect, useState, ReactElement } from 'react';
import useWebSocket, { ReadyState } from 'react-native-use-websocket';


export enum RobotState {
    UNKNOWN = 0,
    READY = 1,
    CALIBRATING = 2,
    EXECUTING = 3,
    ERROR = 4
};

export declare type RobotPosition = {x: number, y: number, theta: number};
export declare type RobotAPIResponse = {
    isConnecting: boolean,
    isConnected: boolean,
    isIdle: boolean,
    isBusy: boolean,
    isError: boolean,
    isCalibrating: boolean,
    isReady: boolean,
    isExecuting: boolean,
    position: RobotPosition | null,
    maxSpeed: number | null,
    setPosition: (pos: RobotPosition) => void,
    setMaxSpeed: (speed: number) => void,
    connect: () => void,
    disconnect: () => void,
    home: () => void,
    calibrate: () => void
};

// const robotSocketUrl = 'ws://192.168.4.1:81';
const robotSocketUrl = 'ws://10.0.2.2:8999';

export const RobotContext = React.createContext<RobotAPIResponse>({
    isConnecting: false,
    isConnected: false,
    isIdle: false,
    isBusy: false,
    isError: false,
    isCalibrating: false,
    isReady: false,
    isExecuting: false,
    position: null,
    maxSpeed: null,
    setPosition: (pos: RobotPosition) => {},
    setMaxSpeed: (speed: number) => {},
    connect: () => {},
    disconnect: () => {},
    home: () => {},
    calibrate: () => {}
});

export const RobotProvider = (props: {children: ReactElement}) => {
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
    
    const value = {
        isConnecting: (readyState === ReadyState.CONNECTING),
        isConnected: (readyState === ReadyState.OPEN),
        isIdle: (robotState === RobotState.UNKNOWN),
        isBusy: (robotState === RobotState.CALIBRATING || robotState === RobotState.EXECUTING),
        isError: (robotState === RobotState.ERROR),
        isCalibrating: (robotState === RobotState.CALIBRATING),
        isReady: (robotState === RobotState.READY),
        isExecuting: (robotState === RobotState.EXECUTING),
        position: position,
        maxSpeed: maxSpeed,
        setPosition: setTargetPositionHandler,
        setMaxSpeed: setMaxSpeedHandler,
        connect: connectHandler,
        disconnect: disconnectHandler,
        home: homeHandler,
        calibrate: calibrateHandler
    };

    return (
        <RobotContext.Provider value={value}>{props.children}</RobotContext.Provider>
    );
};

export const useRobot = () => {
    const context = React.useContext(RobotContext)
    if (context === undefined) {
        throw new Error('useCount must be used within a CountProvider')
    }
    return context;
};