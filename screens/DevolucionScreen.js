import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';


export default function DevolucionScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [devolucionExitosa, setDevolucionExitosa] = useState(false);
  const [codigoEquipoActual, setCodigoEquipoActual] = useState(null);


  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const iniciarEscaneo = () => {
    setScanning(true);
    setDevolucionExitosa(false);
  };

 // Actualiza la URL del servidor y mejora el manejo de errores
 const handleBarCodeScanned = async ({ data }) => {
  setScanning(false);
  
  // 1. Validación y limpieza del código
  let codigoEquipo;
  try {
    codigoEquipo = data.toString().trim();
    if (!codigoEquipo || codigoEquipo.length === 0) {
      throw new Error('Código QR vacío o inválido');
    }
    
    // Limpiar posibles caracteres especiales
    codigoEquipo = codigoEquipo.replace(/[^a-zA-Z0-9]/g, '');
  } catch (error) {
    Alert.alert('❌ Error', 'El código QR escaneado no es válido');

    setScanning(true); // Permitir nuevo escaneo
    return;
  }

  setCodigoEquipoActual(codigoEquipo);
  
  // 2. Mostrar confirmación antes de enviar
  Alert.alert(
    'Confirmar devolución',
    `¿Devolver equipo ${codigoEquipo}?`,
    [
      {
        text: 'Cancelar',
        onPress: () => setScanning(true),
        style: 'cancel',
      },
      {
        text: 'Confirmar',
        onPress: () => procesarDevolucion(codigoEquipo),
      },
    ],
    { cancelable: false }
  );
};

const procesarDevolucion = async (codigoEquipo) => {
  try {
    const response = await fetch('http://ip/devoluciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_equipo: codigoEquipo }),
    });

    // Verificar respuesta antes de convertirla a JSON
    const text = await response.text();
    console.log('Respuesta del servidor:', text);

    try {
      const result = JSON.parse(text);
      console.log('JSON recibido:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error en la devolución');
      }

      setDevolucionExitosa(true);
      Alert.alert('✅ Éxito', `Equipo ${codigoEquipo} devuelto correctamente`);
    } catch (error) {
      throw new Error('La respuesta del servidor no es un JSON válido');
    }

  } catch (error) {
    console.error('Error en devolución:', error);
    Alert.alert('❌ Error', error.message || 'Error al procesar la devolución');
    setScanning(true); // Permitir reintento
  }
};


  

  const finalizarTarea = () => {
    Alert.alert('Información', 'Tarea finalizada');
    setDevolucionExitosa(false);
  };

  const cancelarTarea = () => {
    Alert.alert('Cancelado', 'El proceso de devolución fue cancelado');
    setDevolucionExitosa(false);
    setScanning(false);
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso de cámara...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No se tiene acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      {!scanning && !devolucionExitosa && (
        <>
          <Text style={styles.title}>Presiona "Escanear QR Equipo" para iniciar</Text>
          <Button
            title="Escanear QR Equipo"
            onPress={iniciarEscaneo}
            color="blue"
          />
        </>
      )}

      {scanning && !devolucionExitosa && (
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={styles.scanner}
        />
      )}

      {devolucionExitosa && (
        <View style={styles.confirmationContainer}>
          <Text style={styles.successText}>La devolución fue registrada exitosamente</Text>
          <View style={styles.actionButtonsContainer}>
            <Button
              title="Finalizar Tarea"
              onPress={finalizarTarea}
              color="green"
            />
            <Button
              title="Cancelar"
              onPress={cancelarTarea}
              color="red"
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scanner: {
    height: 300,
    width: '90%',
    marginBottom: 20,
  },
  confirmationContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  successText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'green',
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
