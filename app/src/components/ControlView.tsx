import React, { useCallback, useRef, useState } from "react";
import { View, Image, GestureResponderEvent, PanResponderGestureState } from "react-native";
import Draggable from "react-native-draggable";
import { useTheme } from "react-native-paper";
import { MotorPosition, RobotPosition } from "../robot/api";
import ControlPanel from "./ControlPanel";
import ControlPin from "./ControlPin";


type Props = {
    position: MotorPosition | null,
    targetPosition: RobotPosition | null,
    setTargetPosition: (pos: RobotPosition) => void,
    disabled?: boolean
};

const ControlView = (props: Props) => {
    const theme = useTheme();
    const controlViewRef = useRef(null);
    const [controlViewLayout, setControlViewLayout] = useState({x: 0, y: 0, width: 0, height: 0});
    const [controlPosition, setControlPosition] = useState({x: 0, y: 0});

    const disabled = props.disabled ?? false;
    
    const toRobotSpace = (pos: {x: number, y: number}) => {
        return {
            x: pos.x - controlViewLayout.width / 2, 
            y: -pos.y + controlViewLayout.height * 0.6
        };
    }

    const dragHandler = useCallback((event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const rx = gestureState.moveX - controlViewLayout.x;
        const ry = gestureState.moveY - controlViewLayout.y;
        const {x, y} = toRobotSpace({x: rx, y: ry});
        setControlPosition({x, y});
        props.setTargetPosition({x, y, theta: 0});
    }, [controlViewLayout]);

    return (
        <View 
            ref={controlViewRef}
            onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                controlViewRef.current?.measure((x, y, w, h, px, py) => {
                    console.log(x, y, w, h);
                    setControlViewLayout({x: px, y: py, width: layout.width, height: layout.height});
                })
            }}
            style={{
                alignItems: 'center',
                opacity: disabled ? 0.5 : 1
            }}
        >
            <ControlPanel size={controlViewLayout.width}/>
            <ControlPin
                size={28} 
                color={theme.colors.primary}
                style={{
                    position: 'absolute',
                    top: -controlPosition.y - 14 + controlViewLayout.height * 0.58,
                    left: controlPosition.x - 14 + controlViewLayout.width * 0.5,
                    opacity: (controlViewLayout.width === 0 || controlViewLayout.height === 0) ? 0 : 1

                }}
            />
            <Draggable
                x={0}
                y={0}
                onDrag={dragHandler}
                minX={0}
                maxX={0}
                minY={0}
                maxY={0}
                disabled={disabled}
            >
                <ControlPin
                    size={controlViewLayout.width} 
                    color={"red"}
                    style={{
                        opacity: 0
                    }}
                />
            </Draggable>
        </View>
    );
};

export default React.memo(ControlView);