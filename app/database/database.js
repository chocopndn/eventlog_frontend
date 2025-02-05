import * as SQLite from "expo-sqlite";

const setupDatabase = async () => {
  const db = await SQLite.openDatabaseAsync("eventlog.db");

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    DROP TABLE IF EXISTS events;

    CREATE TABLE IF NOT EXISTS users (
      id_number INTEGER PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      department_id INTEGER NOT NULL,
      block_id INTEGER NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS events (
      event_id INTEGER PRIMARY KEY,
      event_name_id INTEGER NOT NULL, 
      event_name TEXT NOT NULL,
      venue TEXT NOT NULL,
      scan_personnel TEXT NOT NULL,
      event_dates TEXT NOT NULL, 
      am_in TEXT,
      am_out TEXT,
      pm_in TEXT,
      pm_out TEXT
    );
  `);

  return db;
};

export { setupDatabase };
