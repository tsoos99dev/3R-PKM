import { PropsWithChildren } from "react";
import { Image, View } from "react-native";
import { useTheme } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialIcons'


type Props = {
    name: string,
    size?: number,
    color?: string
}


const RoboIcon = (props: Props) => {
    const theme = useTheme();

    const size = props.size ?? 64;
    const color = props.color ?? 'white';

    return (
        <View style={{
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Image 
                source={require('../assets/logoBase.png')}
                style={{
                    width: props.size,
                    height: props.size,
                    tintColor: color
                }}
            />
            <Icon 
                name={props.name}
                size={size * 0.33} 
                color={color}
                style={{
                    position: 'absolute',
                    paddingTop: size * 0.18
                }}
        />
        </View>
    );
};

export default RoboIcon