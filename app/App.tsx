import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Appbar, MD3DarkTheme as DefaultTheme, Provider as PaperProvider, Text } from 'react-native-paper';
import FindDeviceScreen from './src/screens/FindDevice';
import { useRobot } from './src/robot/api';
import ControlScreen from './src/screens/Control';

const theme = {
  ...DefaultTheme,
  version: 3,
  mode: 'exact',
  colors: {
    ...DefaultTheme.colors,
    primary: '#80deea',
    onPrimary: 'rgba(0, 0, 0, 0.87)',
    background: '#303030',
    onBackground: '#fff',
    surface: '#424242',
    onSurface: '#fff',
    surfaceVariant: '#828282',
    onSurfaceVariant: 'rgba(255, 255, 255, 0.7)',
    backdrop: '#000',
    textSecondary: 'rgba(255, 255, 255, 0.7)'
  }
}

export type RootStackParamList = {
  Find: undefined;
  Control: undefined;
};

export type StackNavigation = NativeStackNavigationProp<RootStackParamList>;
export type StackNavigationProps = {
  navigation: StackNavigation;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function CustomNavigationBar({options, navigation, back}: any) {
  return (
    <Appbar.Header>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={options.title} />
    </Appbar.Header>
  );
}


const App = () => {
  const {
    connect, 
    disconnect,
    isConnecting, 
    isConnected,
    isStarting,
    isBusy,
    isCalibrating,
    isError,
    isReady,
    isExecuting,
    position,
    maxSpeed,
    setTargetPosition,
    setMaxSpeed,
    home,
    calibrate
  } = useRobot();

  return (
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <Stack.Navigator
          initialRouteName="Find"
          screenOptions={{
            header: (props) => <CustomNavigationBar {...props} />
          }}
        >
          <Stack.Screen 
            name="Find" 
            options={{ title: 'Find device' }}
          >
            {(props) => {
              return <FindDeviceScreen 
                {...props} 
                connect={connect}
                disconnect={disconnect}
                isConnecting={isConnecting}
                isConnected={isConnected}
              />
            }}
          </Stack.Screen>
          <Stack.Screen 
            name="Control" 
            options={{ title: 'Control' }}
          >
            {(props) => {
              return <ControlScreen 
                {...props}
                isStarting={isStarting}
                isBusy={isBusy}
                isCalibrating={isCalibrating}
                isError={isError}
                isExecuting={isExecuting}
                isReady={isReady}
                isConnected={isConnected}
                position={position}
                maxSpeed={maxSpeed}
                setTargetPosition={setTargetPosition}
                setMaxSpeed={setMaxSpeed}
                home={home}
                calibrate={calibrate}
              />
            }}
          </Stack.Screen>
        </Stack.Navigator>
      </PaperProvider>
    </NavigationContainer>
  );
};

export default App;
