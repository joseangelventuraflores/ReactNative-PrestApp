// screens/PrestamoScreen.js

import React, { useState, useEffect } from 'react';
import { Text, View, Button, StyleSheet, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function PrestamoScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [step, setStep] = useState(1); // 1: escanear alumno, 2: escanear equipo
  const [alumnoQR, setAlumnoQR] = useState(null);
  const [equipoQR, setEquipoQR] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    if (step === 1) {
      setAlumnoQR(data);
      setStep(2);
      setScanned(false); // Para poder escanear el siguiente
    } else if (step === 2) {
      setEquipoQR(data);
      enviarPrestamo(data);
    }
  };

  const enviarPrestamo = async (equipo) => {
    // Simulando envío a BD, aquí luego conectamos con tu backend
    Alert.alert(
      'Préstamo registrado',
      `Alumno: ${alumnoQR}\nEquipo: ${equipo}`
    );

    // Reset para escanear otro préstamo
    setStep(1);
    setAlumnoQR(null);
    setEquipoQR(null);
    setScanned(false);
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso de cámara...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No se tiene acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {step === 1 ? 'Escanea el código QR del ALUMNO' : 'Escanea el código QR del EQUIPO'}
      </Text>

      <View style={styles.scanner}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {alumnoQR && <Text style={styles.info}>Alumno: {alumnoQR}</Text>}
      {equipoQR && <Text style={styles.info}>Equipo: {equipoQR}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scanner: {
    height: 300,
    width: '90%',
    overflow: 'hidden',
    borderRadius: 20,
    marginVertical: 20,
  },
  text: {
    fontSize: 18,
  },
  info: {
    marginTop: 10,
    fontSize: 16,
    color: 'green',
  },
});
