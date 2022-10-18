import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import {
  Button,
  Text,
  useTheme
} from 'react-native-paper';
import { StackNavigation } from '../../App';

const HomeScreen = () => {
    const theme = useTheme()
    const navigation = useNavigation<StackNavigation>();

    return (
        <View style={{
            backgroundColor: theme.colors.background,
            height: '100%'
        }}>
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginVertical: 16
            }}>
                <View style={{
                    
                }}>
                    <Text variant='headlineLarge'>CONNECT TO ROBOT</Text>
                    <Text variant='bodyMedium'>
                        Please make sure your device is connected to 
                        the robot's Wi-Fi
                    </Text>
                </View>
                <Button mode="contained" onPress={() => navigation.navigate('Details')}>
                    CONNECT
                </Button>
            </View>
        </View>
    );
};

  
export default HomeScreen;