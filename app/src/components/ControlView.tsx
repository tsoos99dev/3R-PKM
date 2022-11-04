import React, { useCallback, useRef, useState } from "react";
import { View, Image, GestureResponderEvent, PanResponderGestureState } from "react-native";
import Draggable from "react-native-draggable";
import { useTheme } from "react-native-paper";
import { MotorPosition, RobotPosition } from "../robot/api";
import ControlPanel from "./ControlPanel";
import ControlPin from "./ControlPin";
import { ROBOT_r, ROBOT_L } from '../robot/constants'


type Props = {
    position: MotorPosition | null,
    targetPosition: RobotPosition,
    setTargetPosition: (pos: RobotPosition) => void,
    disabled?: boolean
};

const ControlView = (props: Props) => {
    const theme = useTheme();
    const controlViewRef = useRef(null);
    const [controlViewLayout, setControlViewLayout] = useState({x: 0, y: 0, width: 0, height: 0});

    const disabled = props.disabled ?? false;

    const rS = 0.365 * controlViewLayout.height;
    const xOffset = controlViewLayout.width / 2;
    const yOffset = controlViewLayout.height * 0.615;

    const toRobotSpace = (pos: {x: number, y: number}) => {
        // Scale coords
        const newX = ROBOT_r/rS*(pos.x - xOffset);
        const newY = ROBOT_r/rS*(-pos.y + yOffset);

        // Constrain
        const cXmin = Math.max(-ROBOT_L/3+newY/Math.sqrt(3), -(2*ROBOT_r+newY)/Math.sqrt(3));
        const cXmax = Math.min(newX,ROBOT_L/3-newY/Math.sqrt(3), (2*ROBOT_r+newY)/Math.sqrt(3));
        const cX = Math.max(cXmin, Math.min(newX, cXmax));
        
        const cY = Math.max(-ROBOT_L/(2*Math.sqrt(3)), Math.min(ROBOT_r, newY));

        return {
            x: cX, 
            y: cY
        };
    }

    const toScreenSpace = (pos: {x: number, y: number}) => {
        // Scale coords
        const newX = rS/ROBOT_r*pos.x + xOffset;
        const newY = -rS/ROBOT_r*pos.y + yOffset;

        return {
            x: newX, 
            y: newY
        };
    };

    const dragHandler = useCallback((event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const rx = gestureState.moveX - controlViewLayout.x;
        const ry = gestureState.moveY - controlViewLayout.y;
        const {x, y} = toRobotSpace({x: rx, y: ry});



        props.setTargetPosition({x, y, theta: 0});
    }, [controlViewLayout]);

    const screenPos = toScreenSpace(props.targetPosition);

    return (
        <View 
            ref={controlViewRef}
            onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                // @ts-ignore
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
                size={28} 
                color={theme.colors.primary}
                style={{
                    position: 'absolute',
                    top: screenPos.y - 14,
                    left: screenPos.x - 14,
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
                    // color={"red"}
                    style={{
                        opacity: 0
                    }}
                />
            </Draggable>
        </View>
    );
};

export default React.memo(ControlView);