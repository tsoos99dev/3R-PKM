import React from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useRobot } from "../robot/api";

type Props = {
    isConnected: boolean, 
    isConnecting: boolean,
    isIdle: boolean,
    isReady: boolean,
    isCalibrating: boolean,
    isExecuting: boolean,
    isError: boolean
};

const RobotStatus = (props: Props) => {
    const theme = useTheme();
    
    const connString = (() => {
        if(!props.isConnected) return "Disconnected";
        if(props.isConnecting) return "Connecting...";
        if(props.isReady) return "Ready";
        if(props.isCalibrating) return "Calibrating...";
        if(props.isExecuting) return "Running...";
        if(props.isError) return "Error";
        if(props.isIdle) return "Initialising...";

        return "Connected";
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

export default React.memo(RobotStatus);