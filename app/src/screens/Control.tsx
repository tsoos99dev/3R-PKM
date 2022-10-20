import Slider from "@react-native-community/slider";
import React, { useState } from "react";
import {View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import ControlView from "../components/ControlView";
import PageContainer from "../components/PageContainer";
import { RobotPosition } from "../robot/api";

type Props = {
    isConnected: boolean,
    isError: boolean,
    isCalibrating: boolean,
    isBusy: boolean,
    isReady: boolean,
    isExecuting: boolean,
    position: RobotPosition,
    maxSpeed: number,
    setTargetPosition: (newPosition: RobotPosition) => void,
    setMaxSpeed: (newSpeed: number) => void,
    home: () => void,
    calibrate: () => void
};

const ControlScreen = (props: Props) => {
    const theme = useTheme();
    const [speed, setSpeed] = useState(props.maxSpeed);

    const connString = props.isConnected ? "Connected" : "Disconnected";

    const {x, y, theta} = props.position;
    const xString = x.toFixed(2);
    const yString = y.toFixed(2);
    const thetaString = theta.toFixed(2);
    const speedString = speed.toFixed(2);

    return (
        <PageContainer>
            <View style={{
                flex: 1,
                justifyContent: 'space-between'
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
                    setTargetPosition={props.setTargetPosition}
                />
                <View style={{
                    flex: 1
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
                                    <Text variant="headlineLarge">X:</Text>
                                    <Text variant="headlineLarge">Y:</Text>
                                    <Text variant="headlineLarge">{'\u03B8'}:</Text>
                                </View>
                                <View style={{
                                    alignItems: 'flex-end'
                                }}>
                                    <Text variant="headlineLarge">{xString}</Text>
                                    <Text variant="headlineLarge">{yString}</Text>
                                    <Text variant="headlineLarge">{thetaString}</Text>
                                </View>
                                <View style={{
                                }}>
                                    <Text variant="headlineLarge"> mm</Text>
                                    <Text variant="headlineLarge"> mm</Text>
                                    <Text variant="headlineLarge"> {'\u00b0'}</Text>
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
                            value={speed}
                            onValueChange={(value) => props.setMaxSpeed(value)}
                            thumbTintColor={theme.colors.primary}
                            minimumTrackTintColor={theme.colors.primary}
                            maximumTrackTintColor={theme.colors.surfaceVariant}
                            // disabled={true}
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
                        <Button mode="outlined" onPress={props.calibrate}>CALIBRATE</Button>
                        <Button mode="outlined" onPress={props.home}>HOME</Button>
                    </View>
                </View>
            </View>
        </PageContainer>
    );
};

export default ControlScreen;