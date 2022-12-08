import Slider from "@react-native-community/slider";
import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { formatParam } from "../robot/util";


type Props = {
    speed: number | null,
    setSpeed: (speed: number) => void,
    disabled?: boolean
};

const SpeedControl = (props: Props) => {
    const theme = useTheme();

    const [initialSpeed, setInitialSpeed] = useState<number | null>(null);

    if(initialSpeed === null && props.speed !== null) setInitialSpeed(props.speed);

    const setSpeedHandler = (value: number) => {
        if(disabled) return;
        props.setSpeed(value);
    };

    const disabled = props.disabled ?? false;

    const speedString = formatParam(props.speed);
    
    return (
        <View style={{
            marginVertical: 16
        }}>
            <Text variant="headlineMedium" style={{textAlign: 'center'}}>Max Speed</Text>
            <Slider
                style={{width: '100%', height: 20}}
                minimumValue={0}
                maximumValue={10}
                step={0.1}
                value={initialSpeed ?? 0}
                onValueChange={ setSpeedHandler }
                thumbTintColor={theme.colors.primary}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.surfaceVariant}
                disabled={disabled}
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
    );
};

export default React.memo(SpeedControl);