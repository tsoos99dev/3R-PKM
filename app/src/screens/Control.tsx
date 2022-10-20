import Slider from "@react-native-community/slider";
import React, { useState } from "react";
import {ScrollView, TouchableWithoutFeedback, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import ControlView from "../components/ControlView";
import PageContainer from "../components/PageContainer";
import { RobotPosition } from "../robot/api";

type Props = {
    isConnected: boolean,
    isError: boolean,
    isStarting: boolean,
    isCalibrating: boolean,
    isBusy: boolean,
    isReady: boolean,
    isExecuting: boolean,
    position: RobotPosition | null,
    maxSpeed: number | null,
    setTargetPosition: (newPosition: RobotPosition) => void,
    setMaxSpeed: (newSpeed: number) => void,
    home: () => void,
    calibrate: () => void
};

const ControlScreen = (props: Props) => {
    const theme = useTheme();
    const [targetPosition, setTargetPosition] = useState(props.position);
    const [speed, setSpeed] = useState(props.maxSpeed);

    if(props.position !== null && targetPosition === null) setTargetPosition(props.position);
    if(props.maxSpeed !== null && speed === null) setSpeed(props.maxSpeed);

    const setTargetPositionHandler = (pos: RobotPosition) => {
        setTargetPosition(pos);
        props.setTargetPosition(pos);
    };

    const connString = (() => {
        if(!props.isConnected) return "Disconnected";
        if(props.isStarting) return "Initialising...";
        if(props.isReady) return "Ready";
        if(props.isCalibrating) return "Calibrating...";
        if(props.isExecuting) return "Running...";
        if(props.isError) return "Error";

        return "Unknown";
    })();

    const formatParam = (param: number | null | undefined) => {
        if(!props.isConnected) return "--";
        return param?.toFixed(2) ?? "--";
    };

    const xString = formatParam(props.position?.x);
    const yString = formatParam(props.position?.y);
    const thetaString = formatParam(props.position?.theta);
    const speedString = formatParam(props.maxSpeed);

    const xTargetString = formatParam(targetPosition?.x);
    const yTargetString = formatParam(targetPosition?.y);
    const thetaTargetString = formatParam(props.position?.theta);

    return (
        <PageContainer>
            <ScrollView 
                showsVerticalScrollIndicator={false}
            >
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
                <ControlView
                    position={props.position}
                    setTargetPosition={setTargetPositionHandler}
                    disabled={!props.isConnected || props.isStarting || props.isError || props.isCalibrating}
                />
                <View style={{
                }}>
                    <View style={{
                        flexDirection: 'row'
                    }}>
                        <View style={{
                            flex: 1,
                            borderRadius: 8,
                            borderColor: "#aaa",
                            borderWidth: 3,
                            padding: 8,
                        }}>
                            <View style={{
                                flexDirection: 'row'
                            }}>
                                <View style={{
                                    flex: 1
                                }}>
                                    <Text variant="bodySmall">Axis</Text>
                                    <Text variant="headlineSmall">X:</Text>
                                    <Text variant="headlineSmall">Y:</Text>
                                    <Text variant="headlineSmall">{'\u03B8'}:</Text>
                                </View>
                                <View style={{
                                    flex: 1,
                                    alignItems: 'flex-end'
                                }}>
                                    <Text variant="bodySmall">Current</Text>
                                    <Text variant="headlineSmall">{xString}</Text>
                                    <Text variant="headlineSmall">{yString}</Text>
                                    <Text variant="headlineSmall">{thetaString}</Text>
                                </View>
                                <View style={{
                                    flex: 1,
                                    alignItems: 'flex-end'
                                }}>
                                    <Text variant="bodySmall">Target</Text>
                                    <Text variant="headlineSmall">{xTargetString}</Text>
                                    <Text variant="headlineSmall">{yTargetString}</Text>
                                    <Text variant="headlineSmall">{thetaTargetString}</Text>
                                </View>
                                <View style={{
                                    marginLeft: 8
                                }}>
                                    <Text variant="bodySmall" style={{textAlign: "right"}}>Unit</Text>
                                    <Text variant="headlineSmall"> mm</Text>
                                    <Text variant="headlineSmall"> mm</Text>
                                    <Text variant="headlineSmall"> {'\u00b0'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{
                        marginVertical: 16
                    }}>
                        <Text variant="headlineMedium" style={{textAlign: 'center'}}>Max Speed</Text>
                        <Slider
                            style={{width: '100%', height: 20}}
                            minimumValue={0}
                            maximumValue={10}
                            step={0.1}
                            value={speed ?? 0}
                            onValueChange={(value) => props.setMaxSpeed(value)}
                            thumbTintColor={theme.colors.primary}
                            minimumTrackTintColor={theme.colors.primary}
                            maximumTrackTintColor={theme.colors.surfaceVariant}
                            disabled={!props.isConnected || (!props.isExecuting && !props.isReady)}
                        />
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingHorizontal: 16
                        }}>
                            <Text variant="bodySmall">0 RPM</Text>
                            <Text variant="bodySmall" style={{textAlign: 'center'} }>{speedString} RPM</Text>
                            <Text variant="bodySmall">10 RPM</Text>
                        </View>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-evenly'
                    }}>
                        <Button mode="outlined" disabled={!props.isConnected || !props.isReady} onPress={props.calibrate}>CALIBRATE</Button>
                        <Button mode="outlined" disabled={!props.isConnected || !props.isReady} onPress={props.home}>HOME</Button>
                    </View>
                </View>
                </View>
            </ScrollView>
        </PageContainer>
    );
};

export default ControlScreen;