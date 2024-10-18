import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase(
  { name: 'notepad.db', location: 'default' },
  () => {},
  error => {
    console.error('Error opening database:', error);
  }
);

const createTables = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS instruments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clientId INTEGER,
        name TEXT NOT NULL,
        FOREIGN KEY (clientId) REFERENCES clients(id)
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        instrumentId INTEGER,
        note TEXT NOT NULL,
        FOREIGN KEY (instrumentId) REFERENCES instruments(id)
      );`
    );
  });
};

export const initializeDatabase = () => {
  createTables();
};

export const getDatabase = () => db;
