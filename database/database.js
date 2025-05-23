import { Platform } from "react-native";
let SQLite;
let db;
let isInitializing = false;

if (Platform.OS !== "web") {
  SQLite = require("expo-sqlite");
}

const createTables = async (database) => {
  try {
    await database.execAsync(`PRAGMA journal_mode = WAL;`);
    await database.execAsync(`PRAGMA foreign_keys = ON;`);
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id_number TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        middle_name TEXT,
        last_name TEXT NOT NULL,
        suffix TEXT,
        email TEXT UNIQUE,
        role_id INTEGER NOT NULL,
        role_name TEXT NOT NULL,
        block_id INTEGER,
        block_name TEXT,
        department_id INTEGER,
        department_name TEXT,
        department_code TEXT,
        course_id INTEGER,
        course_name TEXT,
        course_code TEXT,
        year_level_id INTEGER,
        year_level_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        venue TEXT NOT NULL,
        description TEXT,
        scan_personnel TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_by_id TEXT NOT NULL,
        created_by TEXT NOT NULL,
        approved_by_id TEXT,
        approved_by TEXT,
        am_in TIME,
        am_out TIME,
        pm_in TIME,
        pm_out TIME,
        duration INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by_id) REFERENCES users (id_number),
        FOREIGN KEY (approved_by_id) REFERENCES users (id_number)
      );
    `);
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS event_dates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        event_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );
    `);
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_date_id INTEGER NOT NULL,
        student_id_number TEXT NOT NULL,
        am_in BOOLEAN DEFAULT 0,
        am_out BOOLEAN DEFAULT 0,
        pm_in BOOLEAN DEFAULT 0,
        pm_out BOOLEAN DEFAULT 0,
        am_in_time DATETIME,
        am_out_time DATETIME,
        pm_in_time DATETIME,
        pm_out_time DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_date_id) REFERENCES event_dates (id) ON DELETE CASCADE,
        FOREIGN KEY (student_id_number) REFERENCES users (id_number),
        UNIQUE(event_date_id, student_id_number)
      );
    `);
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER NOT NULL,
        event_name TEXT NOT NULL,
        event_date DATE NOT NULL,
        student_id_number TEXT NOT NULL,
        am_in BOOLEAN DEFAULT 0,
        am_out BOOLEAN DEFAULT 0,
        pm_in BOOLEAN DEFAULT 0,
        pm_out BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id),
        FOREIGN KEY (student_id_number) REFERENCES users (id_number),
        UNIQUE(event_id, event_date, student_id_number)
      );
    `);
    await database.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
      CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by_id);
      CREATE INDEX IF NOT EXISTS idx_event_dates_event_id ON event_dates(event_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_event_date ON attendance(event_date_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id_number);
      CREATE INDEX IF NOT EXISTS idx_records_event_date ON records(event_id, event_date);
    `);
  } catch (error) {
    throw error;
  }
};

const validateDatabaseConnection = async (database) => {
  try {
    await database.execAsync("SELECT 1");
    const result = await database.getFirstAsync(
      "SELECT name FROM sqlite_master WHERE type='table' LIMIT 1"
    );
    return true;
  } catch {
    return false;
  }
};

const closeDatabase = async () => {
  if (db) {
    try {
      await db.closeAsync();
    } catch {}
    db = null;
  }
};

const initDB = async () => {
  if (Platform.OS !== "android" && Platform.OS !== "ios") {
    return null;
  }

  if (isInitializing) {
    let attempts = 0;
    while (isInitializing && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    return db;
  }

  try {
    isInitializing = true;

    if (db) {
      const isValid = await validateDatabaseConnection(db);
      if (isValid) {
        return db;
      } else {
        await closeDatabase();
      }
    }

    const newDb = await SQLite.openDatabaseAsync("eventlog.db");
    const isValid = await validateDatabaseConnection(newDb);
    if (!isValid) {
      await newDb.closeAsync();
      throw new Error("New database connection failed validation");
    }

    await createTables(newDb);
    db = newDb;
    return db;
  } catch (error) {
    await closeDatabase();

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await SQLite.deleteDatabaseAsync("eventlog.db");
      const freshDb = await SQLite.openDatabaseAsync("eventlog.db");
      const isValid = await validateDatabaseConnection(freshDb);
      if (!isValid) {
        await freshDb.closeAsync();
        throw new Error("Fresh database connection failed validation");
      }
      await createTables(freshDb);
      db = freshDb;
      return db;
    } catch (resetError) {
      return null;
    }
  } finally {
    isInitializing = false;
  }
};

export const getDatabase = async () => {
  if (!db) {
    return await initDB();
  }
  const isValid = await validateDatabaseConnection(db);
  if (!isValid) {
    return await initDB();
  }
  return db;
};

export const resetDatabaseConnection = async () => {
  await closeDatabase();
  return await initDB();
};

export const checkDatabaseHealth = async () => {
  if (!db) {
    return { healthy: false, reason: "No database instance" };
  }
  const isValid = await validateDatabaseConnection(db);
  return {
    healthy: isValid,
    reason: isValid
      ? "Database is healthy"
      : "Database connection failed validation",
  };
};

export const recreateDatabase = async () => {
  await closeDatabase();
  try {
    await SQLite.deleteDatabaseAsync("eventlog.db");
  } catch {}
  return await initDB();
};

export const clearAllData = async () => {
  if (Platform.OS === "web") {
    return false;
  }
  try {
    const dbInstance = await getDatabase();
    if (!dbInstance) {
      throw new Error("Database connection failed");
    }
    await dbInstance.execAsync("PRAGMA foreign_keys = OFF");
    await dbInstance.execAsync(`
      DELETE FROM attendance;
      DELETE FROM records;
      DELETE FROM event_dates;
      DELETE FROM events;
      DELETE FROM users;
    `);
    await dbInstance.execAsync("PRAGMA foreign_keys = ON");
    return true;
  } catch (error) {
    return false;
  }
};

export const dropAllTables = async () => {
  if (Platform.OS === "web") {
    return false;
  }
  try {
    const dbInstance = await getDatabase();
    if (!dbInstance) {
      throw new Error("Database connection failed");
    }
    await dbInstance.execAsync("PRAGMA foreign_keys = OFF");
    await dbInstance.execAsync(`
      DROP TABLE IF EXISTS attendance;
      DROP TABLE IF EXISTS records;
      DROP TABLE IF EXISTS event_dates;
      DROP TABLE IF EXISTS events;
      DROP TABLE IF EXISTS users;
    `);
    await dbInstance.execAsync("PRAGMA foreign_keys = ON");
    await createTables(dbInstance);
    return true;
  } catch (error) {
    return false;
  }
};

export const executeQuery = async (query, params = []) => {
  try {
    const dbInstance = await getDatabase();
    if (!dbInstance) {
      throw new Error("Database not available");
    }
    if (query.trim().toUpperCase().startsWith("SELECT")) {
      return await dbInstance.getAllAsync(query, params);
    } else {
      return await dbInstance.runAsync(query, params);
    }
  } catch (error) {
    throw error;
  }
};

let initPromise = null;
export const ensureInitialized = async () => {
  if (!initPromise) {
    initPromise = initDB();
  }
  return await initPromise;
};

if (Platform.OS === "android" || Platform.OS === "ios") {
  ensureInitialized().catch((error) => {
    console.error("Auto-initialization failed:", error);
  });
}

export default initDB;
