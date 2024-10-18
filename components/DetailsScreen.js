import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getDatabase } from '../database';

const DetailScreen = ({ route }) => {
  const { instrument } = route.params;
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const db = getDatabase();

  useEffect(() => {
    loadNotes();
  }, [instrument.id]);

  const loadNotes = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM notes WHERE instrumentId = ?', [instrument.id], (_, { rows }) => {
        const notesArray = [];
        for (let i = 0; i < rows.length; i++) {
          notesArray.push(rows.item(i));
        }
        setNotes(notesArray);
      });
    });
  };

  const saveNote = () => {
    if (note.trim()) {
      db.transaction(tx => {
        tx.executeSql('INSERT INTO notes (content, instrumentId) VALUES (?, ?)', [note, instrument.id], () => {
          loadNotes();
          setNote('');
        }, (_, error) => {
          console.error('Error inserting note:', error);
        });
      });
    } else {
      Alert.alert('Erro', 'Por favor, insira uma anotação.');
    }
  };

  const confirmRemoveNote = (id) => {
    Alert.alert(
      'Confirmação',
      'Você tem certeza que deseja remover esta anotação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          onPress: () => removeNote(id),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const removeNote = (id) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM notes WHERE id = ?', [id], loadNotes, (_, error) => {
        console.error('Error deleting note:', error);
      });
    });
  };

  const editNote = (note) => {
    setNote(note.content);
    // Optionally handle editing logic
  };

  return (
    <View style={styles.container}>
      <Text style={styles.detailText}>{instrument.name}</Text>

      <TextInput
        style={styles.input}
        placeholder="Adicionar anotação"
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity style={styles.addButton} onPress={saveNote}>
        <Text style={styles.addButtonText}>Adicionar Anotação</Text>
      </TouchableOpacity>

      <Text style={styles.notesTitle}>Anotações:</Text>
      <FlatList
        data={notes}
        keyExtractor={(note) => note.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>{item.content}</Text>
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => editNote(item)}>
                <Text style={styles.editText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmRemoveNote(item.id)}>
                <Text style={styles.removeText}>Remover</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#f0f4f8',
  },
  detailText: {
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
  notesTitle: {
    fontSize: 20,
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  noteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  noteText: {
    fontSize: 17,
    flex: 1,
    color: '#333',
    marginRight: 10,
  },
  noteActions: {
    flexDirection: 'row',
  },
  editText: {
    color: '#3498db',
    marginRight: 10,
    fontWeight: 'bold',
  },
  removeText: {
    color: '#ff4d4d',
    fontWeight: 'bold',
  },
});

export default DetailScreen;
