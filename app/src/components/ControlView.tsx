import React, { useCallback, useRef, useState } from "react";
import { View, Image, GestureResponderEvent, PanResponderGestureState } from "react-native";
import Draggable from "react-native-draggable";
import { useTheme } from "react-native-paper";
import { RobotPosition } from "../robot/api";
import ControlPanel from "./ControlPanel";
import ControlPin from "./ControlPin";


type Props = {
    position: RobotPosition | null,
    targetPosition: RobotPosition | null,
    setTargetPosition: (pos: RobotPosition) => void,
    disabled?: boolean
};

const ControlView = (props: Props) => {
    const theme = useTheme();
    const controlViewRef = useRef(null);
    const [controlViewLayout, setControlViewLayout] = useState({x: 0, y: 0, width: 0, height: 0});
    const [initialPosition, setInitialPosition] = useState<RobotPosition | null>(null);
    const [controlPosition, setControlPosition] = useState<RobotPosition | null>(null);

    if(props.position !== null && controlPosition === null) setControlPosition(props.position);
    if(props.position !== null && initialPosition === null) setInitialPosition(props.position);

    const disabled = props.disabled ?? false;

    const toScreenSpace = (pos: {x: number, y: number}) => {
        return {
            x: pos.x + controlViewLayout.width / 2, 
            y: -pos.y + controlViewLayout.height * 0.6
        };
    }
    
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
        setControlPosition({x, y, theta: 0});
        props.setTargetPosition({x, y, theta: 0});
    }, [controlViewLayout]);

    const screenControlPos = controlPosition === null ? null : toScreenSpace(controlPosition);
    const screenPos = props.position === null ? null : toScreenSpace({x: props.position.x, y: props.position.y});

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
                alignItems: 'center',
                opacity: disabled ? 0.5 : 1
            }}
        >
            <ControlPanel size={controlViewLayout.width}/>
            <ControlPin
                size={32} 
                color={theme.colors.secondary}
                style={{
                    position: 'absolute',
                    top: (screenPos?.y ?? 0) - 16,
                    left: (screenPos?.x ?? 0) - 16,
                    opacity: screenPos ? 1.0 : 0.0
                }}
            />
            <ControlPin
                size={28} 
                color={theme.colors.primary}
                style={{
                    position: 'absolute',
                    top: (screenControlPos?.y ?? 0) - 14,
                    left: (screenControlPos?.x ?? 0) - 14,
                    opacity: screenControlPos ? 1.0 : 0.0
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