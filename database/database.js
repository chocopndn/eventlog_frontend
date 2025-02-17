import * as SQLite from "expo-sqlite";

const setupDatabase = async () => {
  try {
    const db = await SQLite.openDatabaseAsync("eventlog.db");

    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS departments (
        department_id INTEGER PRIMARY KEY,
        department_name TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS blocks (
        block_id INTEGER PRIMARY KEY,
        block_name TEXT
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id_number INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        suffix TEXT,
        email TEXT UNIQUE NOT NULL,
        role_id INTEGER NOT NULL DEFAULT 1, 
        department_id INTEGER,
        block_id INTEGER, 
        FOREIGN KEY (department_id) REFERENCES departments(department_id),
        FOREIGN KEY (block_id) REFERENCES blocks(block_id)
      );
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
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS event_dates (
        id INTEGER PRIMARY KEY,
        event_id INTEGER NOT NULL,
        event_date DATE NOT NULL,
        FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
      );
    `);

    console.log("Database setup successful");

    return db;
  } catch (error) {
    console.error("Error setting up the database:", error);
    throw new Error("Database setup failed");
  }
};

export { setupDatabase };
