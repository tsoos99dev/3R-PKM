import React from 'react';
import { View, ScrollView } from 'react-native';
import {
  Button,
  Text,
  Surface,
  useTheme
} from 'react-native-paper';

const HomeScreen = () => {
    const theme = useTheme()
    return (
        <View style={{
            backgroundColor: theme.colors.background,
            height: '100%'
        }}>
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Button mode="contained" onPress={() => console.log('Pressed')}>
                    CONNECT
                </Button>
            </View>
        </View>
    );
};

  
export default HomeScreen;