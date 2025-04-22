import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';

export default function LoginScreen({ navigation }) {
  const handleLogin = () => {
    // Aquí irá el login con Google o manual después
    navigation.replace('Cámara'); // Ir directamente a Préstamo por ahora
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido</Text>
      <Button title="Iniciar Sesión" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});
