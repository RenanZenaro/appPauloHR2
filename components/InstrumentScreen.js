import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getDatabase } from '../database';

const InstrumentScreen = ({ route, navigation }) => {
  const { clientId, clientName } = route.params;
  const [instrumentName, setInstrumentName] = useState('');
  const [instruments, setInstruments] = useState([]);
  const db = getDatabase();

  useEffect(() => {
    loadInstruments();
  }, [clientId]);

  const loadInstruments = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM instruments WHERE clientId = ?', [clientId], (_, { rows }) => {
        const instrumentsArray = [];
        for (let i = 0; i < rows.length; i++) {
          instrumentsArray.push(rows.item(i));
        }
        setInstruments(instrumentsArray);
      });
    });
  };

  const addInstrument = () => {
    if (instrumentName.trim()) {
      db.transaction(tx => {
        tx.executeSql('INSERT INTO instruments (name, clientId) VALUES (?, ?)', [instrumentName, clientId], () => {
          loadInstruments();
          setInstrumentName('');
        }, (_, error) => {
          console.error('Error inserting instrument:', error);
        });
      });
    } else {
      Alert.alert('Erro', 'Por favor, insira um nome de instrumento.');
    }
  };

  const confirmRemoveInstrument = (id) => {
    Alert.alert(
      'Confirmação',
      'Você tem certeza que deseja remover este instrumento?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          onPress: () => removeInstrument(id),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const removeInstrument = (id) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM instruments WHERE id = ?', [id], loadInstruments, (_, error) => {
        console.error('Error deleting instrument:', error);
      });
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{clientName}</Text>

      <TextInput
        style={styles.input}
        placeholder="Adicionar Instrumento"
        value={instrumentName}
        onChangeText={setInstrumentName}
      />
      
      <TouchableOpacity style={styles.addButton} onPress={addInstrument}>
        <Text style={styles.addButtonText}>Adicionar</Text>
      </TouchableOpacity>

      <FlatList
        data={instruments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Detail', { instrument: item })}>
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmRemoveInstrument(item.id)}>
              <Text style={styles.removeButtonText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    marginBottom: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
  removeButtonText: {
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
});

export default InstrumentScreen;
