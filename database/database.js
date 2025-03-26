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
            role_name INTEGER NOT NULL,
            block_id INTEGER NULL,
            block_name INTEGER NULL,
            department_id INTEGER NULL,
            department_name INTEGER NULL,
            department_code INTEGER NULL,
            course_id INTEGER NULL,
            course_name TEXT NULL,
            year_level_id INTEGER NULL,
            year_level_name TEXT NULL
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
