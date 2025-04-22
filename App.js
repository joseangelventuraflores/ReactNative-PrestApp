// App.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PrestamoScreen from './screens/PrestamoScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Préstamo">
        <Stack.Screen
          name="Préstamo"
          component={PrestamoScreen}
          options={{ title: 'Registro de Préstamos' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
