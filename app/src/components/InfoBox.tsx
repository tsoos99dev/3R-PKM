import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { RobotPosition } from "../robot/api";
import { formatParam } from "../robot/util";

type Props = {
    position: RobotPosition | null,
    targetPosition: RobotPosition | null,
};

const InfoBox = (props: Props) => {
    const xString = formatParam(props.position?.x);
    const yString = formatParam(props.position?.y);
    const thetaString = formatParam(props.position?.theta);

    const xTargetString = formatParam(props.targetPosition?.x);
    const yTargetString = formatParam(props.targetPosition?.y);
    const thetaTargetString = formatParam(props.targetPosition?.theta);

    return (
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
    );
};

export default React.memo(InfoBox);