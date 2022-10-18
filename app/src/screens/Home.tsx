import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, View } from 'react-native';
import {
  Button,
  Text,
  useTheme
} from 'react-native-paper';
import useWebSocket, { ReadyState } from 'react-native-use-websocket';
import Icon from 'react-native-vector-icons/MaterialIcons'

import { StackNavigation } from '../../App';

const socketUrl = 'wss://echo.websocket.org';


const HomeScreen = () => {
    const theme = useTheme()
    const navigation = useNavigation<StackNavigation>();

    const [connect, setConnect] = useState(false);
    const {
        sendMessage, 
        lastMessage, 
        readyState
    } = useWebSocket(socketUrl, {
        onError: (error) => {
        },
        onClose: (event) => {
            setConnect(false);
        },
        shouldReconnect: (closeEvent) => {
            return connect
        },
    }, connect);

    const connectionStatus = {
        [ReadyState.CONNECTING]: "Connecting...",
        [ReadyState.OPEN]: "Connected",
        [ReadyState.CLOSING]: "Disconnected",
        [ReadyState.CLOSED]: "Disconnected",
        [ReadyState.UNINSTANTIATED]: "Disconnected",
      }[readyState];

    return (
        <View style={{
            backgroundColor: theme.colors.background,
            height: '100%'
        }}>
            <View style={{
                flex: 1,
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: 16
            }}>
                <View style={{
                    width: "100%",
                    alignItems: 'center',
                }}>
                    <Text variant='headlineLarge'>3R-PKM</Text>
                    <Text 
                        variant='bodyLarge' 
                        style={{color: theme.colors.textSecondary}}
                    >
                        {connectionStatus}
                    </Text>
                </View>
                <View style={{
                        justifyContent: 'center',
                }}>
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <Image 
                            source={require('../assets/logoBase.png')}
                            style={{
                                width: 256,
                                height: 256,
                                marginBottom: 64,
                                tintColor: '#f4f4f4'
                            }}
                        />
                        <Icon 
                            name="wifi"
                            size={64} 
                            color="#f4f4f4"
                            style={{
                                position: 'absolute',
                                marginRight: 8
                            }}
                    />
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center'
                    }}>
                        <Button 
                            mode="contained"
                            disabled={readyState === ReadyState.CONNECTING}
                            loading={readyState === ReadyState.CONNECTING}
                            onPress={() => setConnect(true)}
                        >
                            CONNECT
                        </Button>
                    </View>
                </View>
                <View style={{
                    flexDirection: 'row',
                    justifyContent:'flex-start',
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
                    <Text variant='bodyMedium'>
                        Please make sure your device is connected to 
                        the robot's Wi-Fi
                    </Text>
                </View>
            </View>
        </View>
    );
};

  
export default HomeScreen;