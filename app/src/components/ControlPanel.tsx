import React from "react";
import { Image } from "react-native";

type Props = {
    size: number
};

const ControlPanel = (props: Props) => {
    return (
        <Image 
            source={require('../assets/controlArea.png')}
            style={{
                width: props.size,
                height: props.size,
                tintColor: "#ccc"
            }}
        />
    );
};

export default React.memo(ControlPanel);