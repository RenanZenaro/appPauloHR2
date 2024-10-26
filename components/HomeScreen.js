import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const STORAGE_KEY_CLIENTS = '@clients';
const STORAGE_KEY_INSTRUMENTS = '@instruments';
const STORAGE_KEY_NOTES = '@notes';

const HomeScreen = ({ navigation }) => {
  const [item, setItem] = useState('');
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY_CLIENTS);
        if (jsonValue) {
          const clients = JSON.parse(jsonValue);
          setList(clients);
          setFilteredList(clients);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadClients();
  }, []);

  useEffect(() => {
    if (item === '') {
      setFilteredList(list); // Restaura a lista completa ao apagar a busca
    }
  }, [item, list]);

  const saveClients = async (newList) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  const addItem = () => {
    if (item.trim()) {
      const newItem = {
        id: Date.now().toString(),
        text: item,
        createdAt: new Date().toLocaleString(),
      };
      const updatedList = [newItem, ...list];
      setList(updatedList);
      setFilteredList(updatedList);
      saveClients(updatedList);
      setItem('');
    }
  };

  const searchItems = () => {
    if (item.trim() !== '') {
      const filtered = list.filter((i) => i.text.toLowerCase().includes(item.toLowerCase()));
      setFilteredList(filtered);
    }
  };

  const removeClientData = async (clientId) => {
    try {
      const instruments = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY_INSTRUMENTS)) || [];
      const filteredInstruments = instruments.filter((instr) => instr.clientId !== clientId);
      const clientInstruments = instruments.filter((instr) => instr.clientId === clientId);
  
      await AsyncStorage.setItem(STORAGE_KEY_INSTRUMENTS, JSON.stringify(filteredInstruments));
  
      const notes = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY_NOTES)) || [];
      const filteredNotes = notes.filter((note) => !clientInstruments.some((instr) => instr.id === note.instrumentId));
  
      await AsyncStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(filteredNotes));
    } catch (e) {
      console.error(e);
    }
  };

  const confirmRemoveItem = (id) => {
    if (Platform.OS == 'web') {
      if (confirm("Deseja Excluir Este Cliente?")) {
        removeItem(id);
      }
    }
    Alert.alert(
      'Confirmação',
      'Você tem certeza que deseja remover este cliente?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          onPress: () => removeItem(id),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const removeItem = async (id) => {
    const updatedList = list.filter((i) => i.id !== id);
    setList(updatedList);
    setFilteredList(updatedList);
    saveClients(updatedList);
    await removeClientData(id);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Novo Cliente"
          value={item}
          onChangeText={setItem}
        />
        <TouchableOpacity onPress={searchItems} style={styles.iconContainer}>
          <Icon name="search" size={20} color="#888" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={addItem}>
        <Text style={styles.addButtonText}>Adicionar</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Clientes Adicionados:</Text>

      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Instrument', { item })} style={styles.itemContent}>
              <Text style={styles.itemText}>{item.text}</Text>
              <Text style={styles.itemDate}>Criado em: {item.createdAt}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmRemoveItem(item.id)} style={styles.removeButton}>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  iconContainer: {
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 15,
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
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
  itemDate: {
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
  list: {
    marginTop: 5,
  },
});

export default HomeScreen;
