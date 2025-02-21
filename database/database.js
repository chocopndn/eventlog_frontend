import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";

let db;

const initDB = async () => {
  if (!db) {
    try {
      db = await SQLite.openDatabaseAsync("eventlog.db");
    } catch (error) {
      console.error("Error opening database:", error);
      throw new Error("Failed to open the database.");
    }
  }
  return db;
};

const setupDatabase = async () => {
  const dbName = "eventlog.db";
  const dbPath = FileSystem.documentDirectory + "/" + dbName;

  try {
    const dbFileExists = await FileSystem.getInfoAsync(dbPath);

    if (dbFileExists.exists) {
      await FileSystem.deleteAsync(dbPath);
    }

    db = await SQLite.openDatabaseAsync(dbName);

    await db.execAsync("PRAGMA journal_mode = WAL;");
    await db.execAsync("PRAGMA foreign_keys = OFF;");

    await db.execAsync("DROP TABLE IF EXISTS departments;");
    await db.execAsync("DROP TABLE IF EXISTS blocks;");
    await db.execAsync("DROP TABLE IF EXISTS users;");
    await db.execAsync("DROP TABLE IF EXISTS events;");
    await db.execAsync("DROP TABLE IF EXISTS event_dates;");

    await db.execAsync(`
            CREATE TABLE departments (
                department_id INTEGER PRIMARY KEY,
                department_name TEXT NOT NULL
            );
        `);

    await db.execAsync(`
            CREATE TABLE blocks (
                block_id INTEGER PRIMARY KEY,
                block_name TEXT,
                department_id INTEGER,
                FOREIGN KEY (department_id) REFERENCES departments(department_id)
            );
        `);

    await db.execAsync(`
            CREATE TABLE users (
                id_number INTEGER PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                suffix TEXT,
                email TEXT UNIQUE NOT NULL,
                role_id INTEGER NOT NULL DEFAULT 1,
                department_id INTEGER,
                block_id INTEGER,
                block_name TEXT,
                course_id INTEGER,
                course_name TEXT,
                FOREIGN KEY (department_id) REFERENCES departments(department_id),
                FOREIGN KEY (block_id) REFERENCES blocks(block_id)
            );
        `);

    await db.execAsync(`
            CREATE TABLE events (
                event_id INTEGER PRIMARY KEY,
                event_name TEXT NOT NULL,
                venue TEXT NOT NULL,
                scan_personnel TEXT NOT NULL,
                am_in TEXT,
                am_out TEXT,
                pm_in TEXT,
                pm_out TEXT
            );
        `);

    await db.execAsync(`
            CREATE TABLE event_dates (
                id INTEGER PRIMARY KEY,
                event_id INTEGER NOT NULL,
                event_date TEXT NOT NULL,
                FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE
            );
        `);

    await db.execAsync("PRAGMA foreign_keys = ON;");

    console.log("Database setup successful");
  } catch (error) {
    console.error("Error setting up the database:", error);
    throw new Error("Database setup failed");
  }

  return db;
};

export { initDB, setupDatabase };
