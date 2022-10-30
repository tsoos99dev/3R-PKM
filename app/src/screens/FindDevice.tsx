import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Text,
  useTheme
} from 'react-native-paper';

import Icon from 'react-native-vector-icons/MaterialIcons'
import { StackNavigation } from '../../App';
import PageContainer from '../components/PageContainer';
import RoboIcon from '../components/RoboIcon';

const socketUrl = 'wss://echo.websocket.org';


type Props = {
    connect: () => void,
    disconnect: () => void,
    isConnecting: boolean,
    isConnected: boolean
}


const FindDeviceScreen = (props: Props) => {
    const theme = useTheme();
    const navigation = useNavigation<StackNavigation>();

    useEffect(() => {
        if(props.isConnected) {
            navigation.navigate('Control');
        }
    }, [props.isConnected]);

    const connString = (() => {
        if(props.isConnected) return "Connected";
        if(props.isConnecting) return "Connecting...";
        
        return "Disconnected";
    })(); 

    return (
        <PageContainer>
            <View style={{
                flex: 1,
                justifyContent: 'space-between',
                padding: 16
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
                        justifyContent: 'center',
                }}>
                    <RoboIcon name='wifi' color='#f4f4f4' size={256}/>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        marginTop: 64
                    }}>
                        <Button 
                            mode="contained"
                            disabled={props.isConnecting}
                            loading={props.isConnecting}
                            onPress={() => {
                                props.isConnected ? navigation.navigate('Control') : props.connect()
                            }}
                        >
                            {props.isConnected ? "READY!" : "CONNECT"}
                        </Button>
                    </View>
                </View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <Icon 
                        name="info-outline"
                        size={32} 
                        color="#f4f4f4"
                        style={{
                            marginRight: 8
                        }}
                    />
                    <Text variant='bodyMedium' style={{
                        flex: 1
                    }}>
                        Please make sure your device is connected to 
                        the robot's Wi-Fi
                    </Text>
                </View>
            </View>
        </PageContainer>
    );
};

  
export default FindDeviceScreen;