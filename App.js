import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './components/HomeScreen';
import DetailScreen from './components/DetailsScreen';
import InstrumentScreen from './components/InstrumentScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{title: 'Página Inicial'}} />
        <Stack.Screen name="Instrument" component={InstrumentScreen} options={{title: 'Instrumentos'}} />
        <Stack.Screen name="Detail" component={DetailScreen} options={{title: 'Detalhes'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;