import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function PrestamoScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [alumnoQR, setAlumnoQR] = useState(null);
  const [equipoQR, setEquipoQR] = useState(null);
  const [scanType, setScanType] = useState(null); // Para controlar qué QR se está escaneando
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);

    if (scanType === 'alumno') {
      // Validar el código QR del alumno
      if (data.length < 7) {
        Alert.alert('Error', 'El código QR del alumno no es válido');
        setScanned(false);
        return;
      }

      const matricula = data.substring(0, 7).trim();
      const nombre = data.substring(7).trim();
      
      setAlumnoQR({ matricula, nombre });

      Alert.alert('Alumno registrado', `Matrícula: ${matricula}\nNombre: ${nombre}`);
    } else if (scanType === 'equipo') {
      if (!data.trim()) {
        Alert.alert('Error', 'El código QR del equipo no es válido');
        setScanned(false);
        return;
      }
    
      const codigoEquipo = data.trim();
      setEquipoQR(codigoEquipo);
    
      // Mensaje ajustado para la nueva lógica de estado
      Alert.alert('Equipo registrado', `Código del equipo: ${codigoEquipo}. Verifica disponibilidad en el servidor.`);
    }
    

    setScanType(null); // Reinicia el tipo de escaneo
  };

  const finalizarRegistro = async () => {
  if (isSubmitting) return; // Evita múltiples envíos
  if (!alumnoQR || !equipoQR) {
    Alert.alert('Error', 'Faltan datos para finalizar el registro');
    return;
  }

  setIsSubmitting(true); // Bloquea nuevos envíos

  try {
    const response = await fetch('http://ip/prestamos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matricula: alumnoQR.matricula,
        codigo_equipo: equipoQR,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar el préstamo');
    }

    Alert.alert('✅ Éxito', 'Préstamo registrado correctamente');
    resetRegistro();
  } catch (error) {
    Alert.alert('❌ Error', error.message || 'No se pudo conectar al servidor');
  } finally {
    setIsSubmitting(false); // Libera el botón después del intento
  }
};

  
  const resetRegistro = () => {
    setAlumnoQR(null);
    setEquipoQR(null);
    setScanned(false);
    setScanType(null); // Reinicia el tipo de escaneo
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso de cámara...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No se tiene acceso a la cámara</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Préstamo</Text>

      <View style={styles.infoContainer}>
        {alumnoQR && (
          <Text style={styles.infoText}>Alumno: {alumnoQR.nombre} (Matrícula: {alumnoQR.matricula})</Text>
        )}
        {equipoQR && (
          <Text style={styles.infoText}>Equipo: {equipoQR}</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="QR Alumno"
          onPress={() => {
            setScanned(false);
            setScanType('alumno');
          }}
          color="blue"
        />
        <Button
          title="QR Equipo"
          onPress={() => {
            setScanned(false);
            setScanType('equipo');
          }}
          color="green"
        />
      </View>

      {scanType && (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}
 
      {!scanType && (
       <View style={styles.actionButtonsContainer}>
         <Button
           title={isSubmitting ? "Registrando..." : "Finalizar Registro"}
          onPress={finalizarRegistro}
           disabled={!alumnoQR || !equipoQR || isSubmitting}
             color="blue"
        />


         <Button
            title="Cancelar Registro"
            onPress={resetRegistro}
            color="red"
        />
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    width: '100%',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
    color: 'black',
  },
  buttonContainer: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButtonsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
