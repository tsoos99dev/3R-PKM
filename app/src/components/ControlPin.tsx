import React, { Ref, useCallback, useEffect, useRef, useState } from "react";
import { LayoutRectangle, StyleProp, View, ViewStyle } from "react-native";

type Props = {
    x?: number,
    y?: number,
    size?: number,
    color?: string,
    style?: StyleProp<ViewStyle>
    setControlPinLayout?: (layout: LayoutRectangle) => void
}


const ControlPin = (props: Props) => {
    const [controlPinLayout, setControlPinLayout] = useState({x: 0, y: 0, width: 0, height: 0});

    const x = props.x ?? 0;
    const y = props.y ?? 0;
    const size = props.size ?? 32;
    const color = props.color ?? "white";
    const style = props.style ?? {};

    return (
        <View 
            style={[{
                height: size,
                width: size,
                backgroundColor: color,
                borderRadius: 56
            }, style]} 
        />
    );
};

export default ControlPin;