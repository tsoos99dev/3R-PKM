import React from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useRobot } from "../robot/api";

type Props = {
};

const RobotStatus = (props: Props) => {
    const theme = useTheme();
    const {
        isConnected, 
        isConnecting,
        isStarting,
        isReady,
        isCalibrating,
        isExecuting,
        isError,
    } = useRobot();
    
    const connString = (() => {
        if(isConnected) return "Connected";
        if(isConnecting) return "Connecting...";
        if(isStarting) return "Initialising...";
        if(isReady) return "Ready";
        if(isCalibrating) return "Calibrating...";
        if(isExecuting) return "Running...";
        if(isError) return "Error";

        return "Disconnected";
    })();

    return (
        <View style={{
            padding: 16
        }}>
            <View style={{
                alignItems: 'center',
            }}>
                <Text variant='headlineLarge'>3R-PKM</Text>
                <Text 
                    variant='bodyLarge' 
                    style={{color: theme.colors.textSecondary}}
                >
                    {connString}
                </Text>
            </View>
        </View>
    );
};

export default RobotStatus;