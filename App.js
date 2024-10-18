import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initializeDatabase } from './database';
import HomeScreen from './components/HomeScreen';
import InstrumentScreen from './components/InstrumentScreen';
import DetailScreen from './components/DetailsScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    initializeDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Instrument" component={InstrumentScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
