import Slider from "@react-native-community/slider";
import React, { useCallback, useRef, useState } from "react";
import { Animated, Dimensions, GestureResponderEvent, Image, PanResponder, PanResponderGestureState, View } from "react-native";
import Draggable from "react-native-draggable";
import { Button, Text, TextInput, useTheme } from "react-native-paper";
import PageContainer from "../components/PageContainer";
import { RobotPosition } from "../robot/api";

type Props = {
    isConnected: boolean,
    isError: boolean,
    isCalibrating: boolean,
    isBusy: boolean,
    isReady: boolean,
    isExecuting: boolean,
    currentPosition: RobotPosition,
    setCurrentPosition: (newPosition: {x: number, y: number, theta: number}) => void
};

const ControlScreen = (props: Props) => {
    const theme = useTheme();
    const [position, setPosition] = useState({x: 0, y: 0});
    const [speed, setSpeed] = useState(0);

    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const toScreenSpace = (pos: {x: number, y: number}) => {
        return {x: pos.x + windowWidth / 2 - 16, y: pos.y + windowWidth / 2 - 16};
    }
    
    const toRobotSpace = (pos: {x: number, y: number}) => {
        return {x: pos.x - windowWidth / 2 + 16, y: pos.y - windowWidth / 2 + 16};
    }

    const connString = props.isConnected ? "Connected" : "Disconnected";

    const {x, y, theta} = props.currentPosition;
    const initialScreenPos = toScreenSpace({x: 0, y: 0});
    const screenPos = toScreenSpace({x: position.x, y: position.y});
    const screenCurrentPos = toScreenSpace({x, y});
    const xString = x.toFixed(2);
    const yString = y.toFixed(2);
    const thetaString = theta.toFixed(2);
    const speedString = speed.toFixed(2);

    const dragHandler = useCallback((event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const rx = gestureState.moveX;
        const ry = gestureState.moveY;
        console.log(rx, ry);
        const rPos = toRobotSpace({x: rx, y: ry});
        // console.log(rPos);
        setPosition(rPos);
    }, []);

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
                <View style={{
                    flex: 1,
                    alignItems: 'center',
                    marginVertical: 8
                }}>
                    <Image 
                        source={require('../assets/controlArea.png')}
                        style={{
                            width: '100%',
                            height: '100%',
                            tintColor: "#ccc"
                        }}
                    />
                    <View style={{
                        height: 28,
                        width: 28,
                        backgroundColor: theme.colors.secondary,
                        borderRadius: 56,
                        position: 'absolute',
                        top: screenCurrentPos.y-14,
                        left: screenCurrentPos.x-14,
                    }} />
                    <Draggable 
                        x={initialScreenPos.x-12}
                        y={initialScreenPos.y-12}
                        onDrag={dragHandler}
                        // minX={screenCurrentPos.y}
                        minY={64}
                        maxY={300}
                    >
                        <View style={{
                            height: 24,
                            width: 24,
                            backgroundColor: theme.colors.primary,
                            borderRadius: 48
                        }} />
                    </Draggable>
                </View>
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
                            onValueChange={(value) => setSpeed(value)}
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
                        <Button mode="outlined" onPress={()=> console.log('Calibrate')}>CALIBRATE</Button>
                        <Button mode="outlined" onPress={()=> console.log('Home')}>HOME</Button>
                    </View>
                </View>
            </View>
        </PageContainer>
    );
};

export default ControlScreen;