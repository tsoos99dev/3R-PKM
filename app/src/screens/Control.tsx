import Slider from "@react-native-community/slider";
import React, { useState } from "react";
import {ScrollView, TouchableWithoutFeedback, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import ControlView from "../components/ControlView";
import InfoBox from "../components/infoBox";
import PageContainer from "../components/PageContainer";
import RobotStatus from "../components/RobotStatus";
import SpeedControl from "../components/SpeedControl";
import { RobotPosition, useRobot } from "../robot/api";

type Props = {
};

const ControlScreen = (props: Props) => {
    const theme = useTheme();
    const {
        position,
        maxSpeed,
        isConnected, 
        isStarting,
        isReady,
        isCalibrating,
        isExecuting,
        isError,
        setPosition,
        setMaxSpeed,
        calibrate,
        home,
    } = useRobot();

    const [targetPosition, setTargetPosition] = useState(position);

    if(position !== null && targetPosition === null) setTargetPosition(position);

    const setTargetPositionHandler = (pos: RobotPosition) => {
        setTargetPosition(pos);
        setPosition(pos);
    };

    return (
        <PageContainer>
            <ScrollView 
                showsVerticalScrollIndicator={false}
            >
                <RobotStatus />
                <ControlView
                    position={position}
                    targetPosition={targetPosition}
                    setTargetPosition={setTargetPositionHandler}
                    disabled={!isConnected || isStarting || isError || isCalibrating}
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
                        <Button mode="outlined" disabled={!isConnected || !isReady} onPress={home}>HOME</Button>
                    </View>
                </View>
            </ScrollView>
        </PageContainer>
    );
};

export default ControlScreen;