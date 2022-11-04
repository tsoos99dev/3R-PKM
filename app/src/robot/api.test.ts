import express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

enum RobotState {
    UNKNOWN = 0,
    READY = 1,
    CALIBRATING = 2,
    EXECUTING = 3,
    ERROR = 4
};

declare type MotorPosition = {theta1: number, theta2: number, theta3: number};
declare type RobotPosition = {x: number, y: number, theta: number};

let currentState = RobotState.UNKNOWN;
setTimeout(() => {
    currentState = RobotState.READY;
}, 5000);

let currentPos: MotorPosition = {
    theta1: -10, theta2: 30, theta3: 0.2
};

let currentSpeed = 5;

let stateTimer: null | NodeJS.Timer  = null;
let readyTimer: null | NodeJS.Timer  = null;

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({server});

console.log('Starting...');

wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
        console.log('received: %s', message);

        const command = JSON.parse(message);
        switch(command.type) {
            case "home": 
                home();
                break;
            case "calibrate": 
                calibrate();
                break;
            case "setPosition": 
                setPosition(command.position);
                break;
            case "setSpeed": 
                setSpeed(command.maxSpeed);
                break;
        }

        ws.send(`Hello, you sent -> ${message}`);
    });

    console.log("Connected");
    stateTimer = setInterval(() => {
        ws.send(JSON.stringify({
            maxSpeed: currentSpeed, 
            position: currentPos,
            status: currentState
        }));
    }, 100);
});

wss.on('close', (ws: WebSocket) => {
    if(stateTimer !== null) {
        clearInterval(stateTimer);
    }
    console.log("Closed");
});

wss.on('error', (ws: WebSocket) => {
    if(stateTimer !== null) {
        clearInterval(stateTimer);
    }
    console.log("Error");
});


server.listen(process.env.PORT || 8999, () => {
    console.log(`Server started on port ${(server.address() as WebSocket.AddressInfo).port} :)`);
});

const home = () => {
    currentState = RobotState.EXECUTING;
    setTimeout(() => {
        currentPos.theta1 = 0;
        currentPos.theta2 = 0;
        currentPos.theta3 = 0;
        currentState = RobotState.READY;
    }, 2000);
};

const calibrate = () => {
    currentState = RobotState.CALIBRATING;
    setTimeout(() => {
        currentPos.theta1 = 0;
        currentPos.theta2 = 0;
        currentPos.theta3 = 0;
        currentState = RobotState.READY;
    }, 3000);
};

const setSpeed = (speed: number) => {
    setTimeout(() => {
        currentSpeed = speed;
    }, 500);
};

const setPosition = (pos: MotorPosition) => {
    currentState = RobotState.EXECUTING;
    setTimeout(() => {
        currentPos.theta1 = pos.theta1;
        currentPos.theta2 = pos.theta2;
        currentPos.theta3 = pos.theta3;

        if(readyTimer !== null) clearInterval(readyTimer);
        readyTimer = setTimeout(() => {
            currentState = RobotState.READY;
        }, 1000);
    }, 500);
};