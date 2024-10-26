import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_INSTRUMENTS = '@instruments';
const STORAGE_KEY_NOTES = '@notes';

const InstrumentScreen = ({ route, navigation }) => {
  const { item } = route.params;  // Cliente recebido da HomeScreen
  const [instrument, setInstrument] = useState('');
  const [instrumentsList, setInstrumentsList] = useState([]);

  useEffect(() => {
    const loadInstruments = async () => {
      try {
        const storedInstruments = await AsyncStorage.getItem(STORAGE_KEY_INSTRUMENTS);
        if (storedInstruments) {
          const parsedInstruments = JSON.parse(storedInstruments);
          const clientInstruments = parsedInstruments.filter((instr) => instr.clientId === item.id);
          setInstrumentsList(clientInstruments);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadInstruments();
  }, []);

  const saveInstruments = async (newList) => {
    try {
      const allInstruments = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY_INSTRUMENTS)) || [];
      const updatedInstruments = allInstruments.filter((instr) => instr.clientId !== item.id).concat(newList);
      await AsyncStorage.setItem(STORAGE_KEY_INSTRUMENTS, JSON.stringify(updatedInstruments));
    } catch (e) {
      console.error(e);
    }
  };

  const addInstrument = () => {
    if (instrument.trim()) {
      const newInstrument = {
        id: Date.now().toString(),
        text: instrument,
        createdAt: new Date().toLocaleString(),
        clientId: item.id,
      };
      const updatedList = [newInstrument, ...instrumentsList];
      setInstrumentsList(updatedList);
      saveInstruments(updatedList);
      setInstrument('');
    }
  };

  const confirmRemoveInstrument = (id) => {
    if (Platform.OS == 'web') {
      if (confirm("Deseja Excluir Este Instrumento?")) {
        removeInstrument(id);
      }
    }
    Alert.alert(
      'Confirmação',
      'Tem certeza de que deseja remover este instrumento?',
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

  const removeInstrument = async (id) => {
    const updatedList = instrumentsList.filter((instr) => instr.id !== id);
    setInstrumentsList(updatedList);
    saveInstruments(updatedList);

    try {
      const notes = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY_NOTES)) || [];
      const filteredNotes = notes.filter((note) => note.instrumentId !== id);
      await AsyncStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(filteredNotes));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.text}</Text>

      <TextInput
        style={styles.input}
        placeholder="Novo Instrumento"
        value={instrument}
        onChangeText={setInstrument}
      />

      <TouchableOpacity style={styles.addButton} onPress={addInstrument}>
        <Text style={styles.addButtonText}>Adicionar</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Instrumentos Adicionados:</Text>

      <FlatList
        data={instrumentsList}
        keyExtractor={(instr) => instr.id}
        renderItem={({ item: instr }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Detail', { instrument: instr })} style={styles.cardContent}>
              <View>
                <Text style={styles.instrumentText}>{instr.text}</Text>
                <Text style={styles.createdAtText}>Criado em: {instr.createdAt}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmRemoveInstrument(instr.id)} style={styles.removeButton}>
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
  subtitle: {
    fontSize: 20,
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instrumentText: {
    fontSize: 18,
    color: '#333',
  },
  createdAtText: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  removeButton: {
    backgroundColor: '#ff4d4d',
    borderRadius: 5,
    padding: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default InstrumentScreen;