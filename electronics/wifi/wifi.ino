#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <ArduinoQueue.h>

#define F_CPU 80000000L

enum RobotState { 
  UNKNOWN = 0,
  READY = 1,
  CALIBRATING = 2,
  EXECUTING = 3,
  ERROR = 4
};

WebSocketsServer webSocket = WebSocketsServer(81);

char message[256];
DynamicJsonDocument stat(1024);
DynamicJsonDocument command(1024);

bool waitingForStat = false;

ArduinoQueue<String> commandQueue(32);


typedef struct {
  unsigned char q1;
  unsigned char q2;
  unsigned char q3;
} MotorPos;


typedef struct {
  float x;
  float y;
  float theta;
} RobotPos;


void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
//            Serial.printf("[%u] Disconnected!\n", num);
      break;
    case WStype_CONNECTED:
//            IPAddress ip = webSocket.remoteIP(num);
//            Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
          
      serializeJson(stat, message);
      webSocket.sendTXT(num, message);
      break;
    case WStype_TEXT:
//            Serial.printf("[%u] get Text: %s\n", num, payload);

      if(commandQueue.isFull()) return;
      deserializeJson(command, payload);

      String commandType = command["type"];
      if(commandType == "setPosition") {
        float x = command["position"]["x"];
        float y = command["position"]["y"];
        float theta = command["position"]["theta"];

        RobotPos pos = {x, y, theta};
        MotorPos motorPos = inverseKinematics(pos);
        commandQueue.enqueue("p" + String(motorPos.q1) + String(motorPos.q2) + String(motorPos.q3) + "\n");
      } else if(commandType == "setSpeed") {
        command["maxSpeed"];
        unsigned char maxSpeed;
        commandQueue.enqueue("m" + String(maxSpeed) + "\n");
      }
      else if(commandType == "reset") {
        commandQueue.enqueue("r\n");
      }
      else if(commandType == "home") {
        commandQueue.enqueue("h\n");
      }
      else if(commandType == "calibrate") {
        commandQueue.enqueue("c\n");
      }
      break;
  }
}


RobotPos forwardKinematics(MotorPos pos) {
  return {0, 0, 0};
}


MotorPos inverseKinematics(RobotPos pos) {
  return {0, 0, 0};
}


void checkStat() {
  if(!waitingForStat) {
    if(commandQueue.isFull()) return;

    commandQueue.enqueue("s\n");
    waitingForStat = true;
    return;
  }
  if(!Serial.available()) return;

  waitingForStat = false;

  unsigned char q1 = Serial.read();
  unsigned char q2 = Serial.read();
  unsigned char q3 = Serial.read();

  MotorPos motorPos = {q1, q2, q3};
  RobotPos pos = forwardKinematics(motorPos);

  stat["x"] = pos.x;
  stat["y"] = pos.y;
  stat["theta"] = pos.theta;
  stat["status"] = Serial.read();
  Serial.read();  // Pop EOL
}


void sendCommands() {
  checkStat();

  if(commandQueue.isEmpty()) return;

  String commandString = commandQueue.dequeue();
  Serial.print(commandString);
}

void setup() {
  Serial.begin(115200);

  Serial.println();
  Serial.println();
  Serial.println();

  // Boot delay
  delay(1000);

//  Serial.println("Configuring AP...");
//  Serial.println(WiFi.softAP("3R-PKM", "parallelrobot") ? "Ready" : "Failed!");    

  stat["position"]["x"] = 0.0;
  stat["position"]["y"] = 0.0;
  stat["position"]["theta"] = 0.0;
  stat["maxSpeed"] = 0.0;
  stat["status"] = UNKNOWN;
  
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();
  sendCommands();
}
