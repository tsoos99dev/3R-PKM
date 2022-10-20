#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

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

unsigned long time_now = 0;
unsigned long last_update = 0;
unsigned long last_calib = 0;
int calib_period = 3000;
int period = 1000;


void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {

    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] Disconnected!\n", num);
            break;
        case WStype_CONNECTED: {
            IPAddress ip = webSocket.remoteIP(num);
            Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
            
            serializeJson(stat, message);
            webSocket.sendTXT(num, message);
        }
            break;
        case WStype_TEXT:
            Serial.printf("[%u] get Text: %s\n", num, payload);
            deserializeJson(command, payload);

            if(command["type"] == "setPosition") {
              int currentStatus = stat["status"];
              if(currentStatus != EXECUTING) {
                stat["status"] = EXECUTING;
                serializeJson(stat, message);
                webSocket.broadcastTXT(message);
                
                stat["position"]["x"] = command["position"]["x"];
                stat["position"]["y"] = command["position"]["y"];
                stat["position"]["theta"] = command["position"]["theta"];
              }
            }

            if(command["type"] == "setSpeed") {
              stat["maxSpeed"] = command["maxSpeed"];
            }

            if(command["type"] == "calibrate") {
              stat["status"] = CALIBRATING;
              last_calib = time_now;
            }
            
            break;
    }

}

void setup() {
    Serial.begin(115200);

    Serial.println();
    Serial.println();
    Serial.println();

    for(uint8_t t = 4; t > 0; t--) {
        Serial.printf("[SETUP] BOOT WAIT %d...\n", t);
        Serial.flush();
        delay(1000);
    }

    Serial.println("Configuring AP...");
    Serial.println(WiFi.softAP("3R-PKM", "parallelrobot") ? "Ready" : "Failed!");    

    stat["position"]["x"] = -4.0;
    stat["position"]["y"] = 2.0;
    stat["position"]["theta"] = 30.0;
    stat["maxSpeed"] = 2.0;
    stat["status"] = READY;
    webSocket.begin();
    webSocket.onEvent(webSocketEvent);
}

void loop() {
    time_now = millis();
    
    webSocket.loop();

    int currentStatus = stat["status"];

    if(currentStatus == CALIBRATING && time_now - last_calib > calib_period) {
      stat["status"] = READY;
    }

    if(time_now - last_update > period) {
      last_update = time_now;
      if(currentStatus == EXECUTING) {
        stat["status"] = READY;
      }
      serializeJson(stat, message);
      webSocket.broadcastTXT(message);
    }
}
