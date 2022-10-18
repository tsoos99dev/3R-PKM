import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { Appbar, MD3DarkTheme as DefaultTheme, Provider as PaperProvider, Text } from 'react-native-paper';
import HomeScreen from './src/screens/Home';
import { View } from 'react-native';

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
    surfaceVariant: '#424242',
    onSurfaceVariant: 'rgba(255, 255, 255, 0.7)',
    backdrop: '#000'
  }
}

export type RootStackParamList = {
  Home: undefined;
  Details: undefined;
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

function DetailsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
    </View>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      <PaperProvider theme={theme}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            header: (props) => <CustomNavigationBar {...props} />
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'Home' }}
          />
          <Stack.Screen 
            name="Details" 
            component={DetailsScreen} 
            options={{ title: 'Details' }}
          />
        </Stack.Navigator>
      </PaperProvider>
    </NavigationContainer>
  );
};

export default App;
