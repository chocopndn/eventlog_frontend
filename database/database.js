import * as SQLite from "expo-sqlite";

let db;

const dropDepartmentsTable = async () => {
  try {
    db = await SQLite.openDatabaseAsync("eventlog.db");
    await db.execAsync("DROP TABLE IF EXISTS departments;");
  } catch (error) {
    console.error("Error dropping departments table:", error);
  }
};

const initDB = async () => {
  if (!db) {
    try {
      db = await SQLite.openDatabaseAsync("eventlog.db");

      await db.execAsync(`PRAGMA journal_mode = WAL;`);

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS roles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS departments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          code TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS year_levels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS courses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          department_id INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS blocks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          course_id INTEGER NOT NULL,
          year_level_id INTEGER NOT NULL,
          department_id INTEGER
        );
        CREATE TABLE IF NOT EXISTS users (
          id_number TEXT PRIMARY KEY,
          role_id INTEGER NOT NULL,
          block_id INTEGER NOT NULL,
          first_name TEXT NOT NULL,
          middle_name TEXT,
          last_name TEXT NOT NULL,
          suffix TEXT,
          email TEXT UNIQUE,
          password_hash TEXT
        );
        CREATE TABLE IF NOT EXISTS event_names (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE
        );
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_name_id INTEGER NOT NULL,
          venue TEXT NOT NULL,
          description TEXT NOT NULL,
          scan_personnel TEXT NOT NULL,
          status TEXT NOT NULL,
          created_by TEXT NOT NULL,
          approved_by TEXT
        );
        CREATE TABLE IF NOT EXISTS event_dates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          event_date DATE NOT NULL,
          am_in TIME,
          am_out TIME,
          pm_in TIME,
          pm_out TIME,
          duration INTEGER
        );
        CREATE TABLE IF NOT EXISTS event_blocks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id INTEGER NOT NULL,
          block_id INTEGER
        );
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_date_id INTEGER NOT NULL,
          student_id_number TEXT NOT NULL,
          am_in TIME,
          am_out TIME,
          pm_in TIME,
          pm_out TIME
        );
        INSERT OR IGNORE INTO roles (name)
        VALUES 
          ('Student'),
          ('Officer'),
          ('Admin'),
          ('Super Admin');
      `);

      return db;
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  } else {
    return db;
  }
};

export default initDB;
