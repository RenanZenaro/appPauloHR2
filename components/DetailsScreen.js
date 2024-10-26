import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_NOTES = '@notes';

const DetailScreen = ({ route }) => {
  const { instrument } = route.params; // Instrumento recebido da InstrumentScreen
  const [note, setNote] = useState('');
  const [notesList, setNotesList] = useState([]);
  const [editingNote, setEditingNote] = useState(null); // Nota em edição

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await AsyncStorage.getItem(STORAGE_KEY_NOTES);
        if (storedNotes) {
          const parsedNotes = JSON.parse(storedNotes);
          const instrumentNotes = parsedNotes.filter((nt) => nt.instrumentId === instrument.id);
          setNotesList(instrumentNotes);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadNotes();
  }, []);

  const saveNotes = async (newList) => {
    try {
      const allNotes = JSON.parse(await AsyncStorage.getItem(STORAGE_KEY_NOTES)) || [];
      const updatedNotes = allNotes.filter((nt) => nt.instrumentId !== instrument.id).concat(newList);
      await AsyncStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(updatedNotes));
    } catch (e) {
      console.error(e);
    }
  };

  const addOrUpdateNote = () => {
    if (note.trim()) {
      let updatedList;
      if (editingNote) {
        updatedList = notesList.map((nt) =>
          nt.id === editingNote.id ? { ...nt, text: note } : nt
        );
        setEditingNote(null);
      } else {
        const newNote = {
          id: Date.now().toString(),
          text: note,
          createdAt: new Date().toLocaleString(),
          instrumentId: instrument.id,
        };
        updatedList = [newNote, ...notesList];
      }
      setNotesList(updatedList);
      saveNotes(updatedList);
      setNote('');
    }
  };

  const editNote = (note) => {
    setNote(note.text);
    setEditingNote(note);
  };

  const confirmRemoveNote = (id) => {
    if (Platform.OS === 'web') {
      if (confirm("Deseja Excluir Esta Nota?")) {
        removeNote(id);
      }
    }
    Alert.alert(
      'Confirmação',
      'Você tem certeza que deseja remover esta nota?',
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

  const removeNote = async (id) => {
    const updatedList = notesList.filter((nt) => nt.id !== id);
    setNotesList(updatedList);
    saveNotes(updatedList);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.detailText}>{instrument.text}</Text>

      <TextInput
        style={styles.input}
        placeholder="Adicionar anotação"
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity style={styles.addButton} onPress={addOrUpdateNote}>
        <Text style={styles.addButtonText}>{editingNote ? 'Atualizar' : 'Adicionar Anotação'}</Text>
      </TouchableOpacity>

      <Text style={styles.additionalStringsTitle}>Anotações Adicionadas:</Text>

      <FlatList
        data={notesList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>{item.text}</Text>
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
    backgroundColor: '#f8f9fa',
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
  additionalStringsTitle: {
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
    marginRight: 10, // Espaço para evitar sobreposição com os botões
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
