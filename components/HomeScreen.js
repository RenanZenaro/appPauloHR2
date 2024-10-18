import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getDatabase } from '../database';

const HomeScreen = ({ navigation }) => {
  const [clientName, setClientName] = useState('');
  const [clients, setClients] = useState([]);
  const db = getDatabase();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM clients', [], (_, { rows }) => {
        const clientsArray = [];
        for (let i = 0; i < rows.length; i++) {
          clientsArray.push(rows.item(i));
        }
        setClients(clientsArray);
      });
    });
  };

  const addClient = () => {
    if (clientName.trim()) {
      db.transaction(tx => {
        tx.executeSql('INSERT INTO clients (name) VALUES (?)', [clientName], () => {
          loadClients();
          setClientName('');
        }, (_, error) => {
          console.error('Error inserting client:', error);
        });
      });
    } else {
      Alert.alert('Erro', 'Por favor, insira um nome de cliente.');
    }
  };

  const confirmRemoveClient = (id) => {
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
          onPress: () => removeClient(id),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const removeClient = (id) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM clients WHERE id = ?', [id], loadClients, (_, error) => {
        console.error('Error deleting client:', error);
      });
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Novo Cliente"
        value={clientName}
        onChangeText={setClientName}
      />
      <TouchableOpacity style={styles.addButton} onPress={addClient}>
        <Text style={styles.addButtonText}>Adicionar</Text>
      </TouchableOpacity>

      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Instrument', { clientId: item.id, clientName: item.name })}>
              <Text style={styles.itemText}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmRemoveClient(item.id)}>
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

export default HomeScreen;
