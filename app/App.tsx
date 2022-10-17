import React from 'react';
import { Appbar, MD3DarkTheme as DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import HomeScreen from './src/screens/Home';

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

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => {}} />
        <Appbar.Content title="3R PKM" />
      </Appbar.Header>
      <HomeScreen/>
    </PaperProvider>
  );
};

export default App;
