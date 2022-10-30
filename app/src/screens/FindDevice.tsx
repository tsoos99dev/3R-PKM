import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import {
  Button,
  Text
} from 'react-native-paper';

import Icon from 'react-native-vector-icons/MaterialIcons'
import { StackNavigation } from '../../App';
import PageContainer from '../components/PageContainer';
import RoboIcon from '../components/RoboIcon';
import RobotStatus from '../components/RobotStatus';
import { useRobot } from '../robot/api';


type Props = {
}


const FindDeviceScreen = (props: Props) => {
    const navigation = useNavigation<StackNavigation>();
    const {isConnected, isConnecting, connect} = useRobot();

    useEffect(() => {
        if(isConnected) {
            navigation.navigate('Control');
        }
    }, [isConnected]);

    return (
        <PageContainer>
            <View style={{
                flex: 1,
                justifyContent: 'space-between',
                padding: 16
            }}>
                <RobotStatus />
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
                            disabled={isConnecting}
                            loading={isConnecting}
                            onPress={() => {
                                isConnected ? navigation.navigate('Control') : connect()
                            }}
                        >
                            {isConnected ? "READY!" : "CONNECT"}
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