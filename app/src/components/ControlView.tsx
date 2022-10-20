import React, { useCallback, useRef, useState } from "react";
import { View, Image, GestureResponderEvent, PanResponderGestureState } from "react-native";
import Draggable from "react-native-draggable";
import { useTheme } from "react-native-paper";
import { RobotPosition } from "../robot/api";
import ControlPin from "./ControlPin";

type Props = {
    position: RobotPosition
    setTargetPosition: (pos: RobotPosition) => void
};

const ControlView = (props: Props) => {
    const theme = useTheme();
    const controlViewRef = useRef(null);
    const [controlViewLayout, setControlViewLayout] = useState({x: 0, y: 0, width: 0, height: 0})
    const [controlPosition, setControlPosition] = useState({x: 0, y: 0})

    const toScreenSpace = (pos: {x: number, y: number}) => {
        return {x: pos.x + controlViewLayout.width / 2, y: -pos.y + controlViewLayout.width / 2};
    }
    
    const toRobotSpace = (pos: {x: number, y: number}) => {
        return {x: pos.x - controlViewLayout.width / 2, y: -pos.y + controlViewLayout.width / 2};
    }

    const dragHandler = useCallback((event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const rx = gestureState.moveX - controlViewLayout.x;
        const ry = gestureState.moveY - controlViewLayout.y;
        const {x, y} = toRobotSpace({x: rx, y: ry});
        setControlPosition({x, y});
        props.setTargetPosition({x, y, theta: 0});
    }, [controlViewLayout]);

    const initialScreenPos = toScreenSpace({x: 0, y: 0});
    const screenControlPos = toScreenSpace(controlPosition);
    const screenPos = toScreenSpace({x: props.position.x, y: props.position.y});

    return (
        <View 
            ref={controlViewRef}
            onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                controlViewRef.current?.measure((x, y, w, h, px, py) => {
                    setControlViewLayout({x: px, y: py, width: layout.width, height: layout.height});
                })
            }}
            style={{
                flex: 1,
                alignItems: 'center',
                marginVertical: 8,
            }}
        >
            <Image 
                source={require('../assets/controlArea.png')}
                style={{
                    width: '100%',
                    height: '100%',
                    tintColor: "#ccc"
                }}
            />
            <ControlPin
                size={32} 
                color={theme.colors.secondary}
                style={{
                    position: 'absolute',
                    top: screenPos.y-16,
                    left: screenPos.x-16
                }}
            />
            <ControlPin
                size={28} 
                color={theme.colors.primary}
                style={{
                    position: 'absolute',
                    top: screenControlPos.y-14,
                    left: screenControlPos.x-14
                }}
            />
            <Draggable
                x={initialScreenPos.x-14}
                y={initialScreenPos.y-14}
                onDrag={dragHandler}
                // minX={screenCurrentPos.y}
                minY={64}
                maxY={300}
            >
                <ControlPin
                    size={28} 
                    color={theme.colors.primary}
                    style={{
                        opacity: 0
                    }}
                />
            </Draggable>
        </View>
    );
};

export default ControlView;