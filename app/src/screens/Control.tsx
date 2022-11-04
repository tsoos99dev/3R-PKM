import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {ScrollView, TouchableWithoutFeedback, View } from "react-native";
import { Button, IconButton, Text, useTheme } from "react-native-paper";
import { StackNavigation } from "../../App";
import ControlView from "../components/ControlView";
import InfoBox from "../components/InfoBox";
import PageContainer from "../components/PageContainer";
import RobotStatus from "../components/RobotStatus";
import SpeedControl from "../components/SpeedControl";
import { RobotPosition, useRobot } from "../robot/api";

type Props = {
};

const ControlScreen = (props: Props) => {
    const navigation = useNavigation<StackNavigation>();
    
    const theme = useTheme();
    const {
        position,
        maxSpeed,
        isConnected, 
        isConnecting,
        isIdle,
        isReady,
        isCalibrating,
        isExecuting,
        isError,
        setPosition,
        setMaxSpeed,
        calibrate,
        home,
    } = useRobot();

    const [targetPosition, setTargetPosition] = useState({x: 0, y: 0, theta: 0});

    const setTargetPositionHandler = (pos: RobotPosition) => {
        setTargetPosition(pos);
        setPosition(pos);
    };

    const homeHandler = () => {
        setTargetPosition({x: 0, y: 0, theta: 0});
        home();
    }

    return (
        <PageContainer>
            <ScrollView 
                showsVerticalScrollIndicator={false}
            >
                <View>
                    <IconButton
                        icon="arrow-left"
                        iconColor={'#aaa'}
                        size={32}
                        onPress={() => navigation.navigate('Find')}
                        style={{
                            position: "absolute",
                            zIndex: 2,
                            marginLeft: 12,
                            marginTop: 12
                        }}
                    />
                    <RobotStatus 
                        isConnected={isConnected}
                        isConnecting={isConnecting}    
                        isCalibrating={isCalibrating}
                        isError={isError}
                        isExecuting={isExecuting}
                        isIdle={isIdle}
                        isReady={isReady}
                    />
                </View>
                
                <ControlView
                    position={position}
                    targetPosition={targetPosition}
                    setTargetPosition={setTargetPositionHandler}
                    disabled={!isConnected || isIdle || isError || isCalibrating}
                />
                <View style={{
                }}>
                    <View style={{
                        paddingHorizontal: 16
                    }}>
                        <InfoBox position={position} targetPosition={targetPosition} />
                    </View>
                    <SpeedControl speed={maxSpeed} setSpeed={setMaxSpeed} disabled={!isConnected || (!isExecuting && !isReady)}/>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-evenly'
                    }}>
                        <Button mode="outlined" disabled={!isConnected || !isReady} onPress={calibrate}>CALIBRATE</Button>
                        <Button mode="outlined" disabled={!isConnected || !isReady} onPress={homeHandler}>HOME</Button>
                    </View>
                </View>
            </ScrollView>
        </PageContainer>
    );
};

export default ControlScreen;