import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';

export default function HistorialScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('prestados'); // 'prestados' o 'historial'

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint =
        filter === 'prestados'
          ? 'http://ip/equipos-prestados'
          : 'http://ip/historial-prestamos';
  
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error('Error al cargar los datos');
      }
  
      const result = await response.json();
  
      // Validar que la respuesta sea un array
      if (!Array.isArray(result)) {
        throw new Error('La respuesta del servidor no es válida');
      }
  
      setData(result);
    } catch (error) {
      Alert.alert('❌ Error', error.message || 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };
  
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      {filter === 'prestados' ? (
  <>
    <Text style={styles.text}>Código Equipo: {item.codigo_equipo}</Text>
    <Text style={styles.text}>Descripción: {item.descripcion}</Text>
    <Text style={styles.text}>Estatus: {item.estatus}</Text>
  </>
) : (
  <>
    <Text style={styles.text}>ID Préstamo: {item.id}</Text>
    <Text style={styles.text}>Matrícula: {item.matricula}</Text>
    <Text style={styles.text}>Nombre: {item.nombre}</Text>  
    <Text style={styles.text}>Código Equipo: {item.codigo_equipo}</Text>
    <Text style={styles.text}>Descripción: {item.descripcion}</Text>
    <Text style={styles.text}>Carrera: {item.carrera}</Text>
    <Text style={styles.text}>Semestre: {item.semestre}</Text>
    <Text style={styles.text}>Fecha/Hora Préstamo: {item.fecha_prestamo}</Text>
    <Text style={styles.text}>
      Fecha/Hora Devolución: {item.fecha_devolucion || 'No devuelto'}
    </Text>
  </>
)}

    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="Ver Prestados/Disponibles"
          onPress={() => setFilter('prestados')}
          color={filter === 'prestados' ? 'blue' : 'gray'}
        />
        <Button
          title="Ver Historial Completo"
          onPress={() => setFilter('historial')}
          color={filter === 'historial' ? 'blue' : 'gray'}
        />
      </View>
      {loading && <Text style={styles.loading}>Cargando datos...</Text>}

{!loading && data.length === 0 && (
  <Text style={styles.noDataText}>No hay datos disponibles</Text>
)}

{!loading && data.length > 0 && (
  <FlatList
    data={data}
    renderItem={renderItem}
    keyExtractor={(item) => item.id ? item.id.toString() : item.codigo_equipo}
  />
)}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  item: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  text: {
    fontSize: 14,
    marginBottom: 5,
  },
  loading: {
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
  },
});
