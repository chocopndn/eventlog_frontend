import * as SQLite from "expo-sqlite";

const setupDatabase = async () => {
  const db = await SQLite.openDatabaseAsync("eventlog.db");

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    DROP TABLE IF EXISTS users; -- 💥 Fix: Remove incorrect table first

    CREATE TABLE IF NOT EXISTS users (
      id_number INTEGER PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      department_id INTEGER NOT NULL,
      block_id INTEGER NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL
    );
  `);

  return db;
};

export { setupDatabase };
