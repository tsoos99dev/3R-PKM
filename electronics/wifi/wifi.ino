#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>
#include <ArduinoQueue.h>

#define F_CPU 80000000L

#define COMMAND_BUFFER_LENGTH 16
#define MESSAGE_BUFFER_LENGTH 128

typedef union
{
  float number;
  uint8_t bytes[4];
} float4byte_t;

enum RobotState { 
  UNKNOWN = 0,
  READY = 1,
  CALIBRATING = 2,
  EXECUTING = 3,
  ERROR = 4
};

typedef struct {
  uint8_t q1;
  uint8_t q2;
  uint8_t q3;
} MotorPos;


typedef struct {
  float x;
  float y;
  float theta;
} RobotPos;

WebSocketsServer webSocket = WebSocketsServer(81);

char commandBuffer[COMMAND_BUFFER_LENGTH];
char message[MESSAGE_BUFFER_LENGTH];
uint8_t currentUser = 0;
StaticJsonDocument<32> stat;
StaticJsonDocument<32> command;

bool waitingForStat = false;

ArduinoQueue<String> commandQueue(32);


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

      if(!commandQueue.isEmpty() && currentUser != num) return;

      currentUser = num;
      
      deserializeJson(command, payload);

      String commandType = command["type"];
      if(commandType == "setPosition") {
        float4byte_t q1;
        q1.number = command["position"]["theta1"];
        float4byte_t q2;
        q2.number = command["position"]["theta2"];
        float4byte_t q3;
        q3.number = command["position"]["theta3"];

        snprintf(commandBuffer, COMMAND_BUFFER_LENGTH, "p%c%c%c%c%c%c%c%c%c%c%c%c\n", 
          q1.bytes[0],
          q1.bytes[1],
          q1.bytes[2],
          q1.bytes[3],
          q2.bytes[0],
          q2.bytes[1],
          q2.bytes[2],
          q2.bytes[3],
          q3.bytes[0],
          q3.bytes[1],
          q3.bytes[2],
          q3.bytes[3]
        );
        commandQueue.enqueue(String(commandBuffer));
      } else if(commandType == "setSpeed") {
        float4byte_t maxSpeed;
        maxSpeed.number = command["maxSpeed"];
        snprintf(commandBuffer, COMMAND_BUFFER_LENGTH, "m%c%c%c%c\n", 
          maxSpeed.bytes[0],
          maxSpeed.bytes[1],
          maxSpeed.bytes[2],
          maxSpeed.bytes[3]
        );
        commandQueue.enqueue(String(commandBuffer));
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


void checkStat() {
  if(!waitingForStat) {
    if(commandQueue.isFull()) return;

    commandQueue.enqueue("s\n");
    waitingForStat = true;
    return;
  }
  if(!Serial.available()) return;

  waitingForStat = false;

  float4byte_t q1;
  q1.bytes[0] = Serial.read();;
  q1.bytes[1] = Serial.read();;
  q1.bytes[2] = Serial.read();;
  q1.bytes[3] = Serial.read();;

  float4byte_t q2;
  q2.bytes[0] = Serial.read();;
  q2.bytes[1] = Serial.read();;
  q2.bytes[2] = Serial.read();;
  q2.bytes[3] = Serial.read();;

  float4byte_t q3;
  q3.bytes[0] = Serial.read();;
  q3.bytes[1] = Serial.read();;
  q3.bytes[2] = Serial.read();;
  q3.bytes[3] = Serial.read();;
  
  stat["theta1"] = q1.number;
  stat["theta2"] = q2.number;
  stat["theta3"] = q3.number;
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

  stat["position"]["theta1"] = 0.0;
  stat["position"]["theta2"] = 0.0;
  stat["position"]["theta3"] = 0.0;
  stat["maxSpeed"] = 0.0;
  stat["status"] = UNKNOWN;
  
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();
  sendCommands();
}
