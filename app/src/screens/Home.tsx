import React, {type PropsWithChildren} from 'react';
import {
  Button,
  ScrollView,
  Text,
  View,
} from 'react-native';

const HomeScreen = () => {
  
    return (
      <View style={{
          height: '100%'
        }}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic">
          <View>
            <Text>3R PKM</Text>
            <Button
              onPress={() => {
                
              }}
              title="Press Me"
            />
          </View>
        </ScrollView>
      </View>
    );
  };
  
  export default HomeScreen;