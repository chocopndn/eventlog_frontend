import { Platform } from "react-native";

let SQLite;
let db;

if (Platform.OS !== "web") {
  SQLite = require("expo-sqlite");
}

const initDB = async () => {
  if (Platform.OS === "android" || Platform.OS === "ios") {
    if (!db) {
      try {
        db = await SQLite.openDatabaseAsync("eventlog.db");

        await db.execAsync(`PRAGMA journal_mode = WAL;`);

        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS users (
            id_number TEXT PRIMARY KEY,
            first_name TEXT NOT NULL,
            middle_name TEXT,
            last_name TEXT NOT NULL,
            suffix TEXT,
            email TEXT UNIQUE,
            role_id INTEGER NOT NULL,
            role_name TEXT NOT NULL,
            block_id INTEGER NULL,
            block_name TEXT NULL,
            department_id INTEGER NULL,
            department_name TEXT NULL,
            department_code INTEGER NULL,
            course_id INTEGER NULL,
            course_name TEXT NULL,
            course_code TEXT NULL,
            year_level_id INTEGER NULL,
            year_level_name TEXT NULL
          );
        `);

        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY,
            event_name TEXT NOT NULL,
            venue TEXT NOT NULL,
            description TEXT,
            scan_personnel TEXT,
            status TEXT NOT NULL,
            created_by_id INTEGER NOT NULL,  
            created_by TEXT NOT NULL,  
            approved_by_id INTEGER,
            approved_by TEXT,  
            am_in TIME DEFAULT 0,
            am_out TIME DEFAULT 0,
            pm_in TIME DEFAULT 0,
            pm_out TIME DEFAULT 0,
            duration INTEGER
          );
        `);

        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS event_dates (
            id INTEGER PRIMARY KEY,
            event_id INTEGER NOT NULL,  
            event_date DATE NOT NULL,
            FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
          );
        `);

        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS attendance (
            event_date_id INTEGER PRIMARY KEY,
            student_id_number INTEGER NOT NULL,  
            am_in BOOLEAN,
            am_out BOOLEAN,
            pm_in BOOLEAN,
            pm_out BOOLEAN
          );
        `);

        return db;
      } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
      }
    } else {
      return db;
    }
  } else {
    console.log("SQLite only supported on Android and iOS.");
  }
};

export default initDB;
