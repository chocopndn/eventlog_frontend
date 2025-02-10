import * as SQLite from "expo-sqlite";

const setupDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync("eventlog.db");

    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id_number INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        suffix TEXT,
        department_name TEXT NOT NULL,
        block_id INTEGER NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS events (
        event_id INTEGER PRIMARY KEY,
        event_name TEXT NOT NULL,
        venue TEXT NOT NULL,
        scan_personnel TEXT NOT NULL,
        am_in TIME,
        am_out TIME,
        pm_in TIME,
        pm_out TIME
      )
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS event_dates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        event_date DATE NOT NULL,
        FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
      )
    `);

    return db;
  } catch (error) {
    console.error("Error setting up the database:", error);
    throw new Error("Database setup failed");
  }
};

export { setupDatabase };
