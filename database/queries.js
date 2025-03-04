import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

let SQLite;
let db;

if (Platform.OS !== "web") {
  SQLite = require("expo-sqlite");
}

const initDB = async () => {
  if (Platform.OS === "web") {
    console.log("Web: initDB - SQLite not supported on web.");
    return null;
  }

  if (!db) {
    db = await SQLite.openDatabaseAsync("eventlog.db");
  }
  return db;
};

const ensureDepartmentExists = async (db, departmentId, departmentName) => {
  if (Platform.OS === "web") return;

  const existingDepartment = await db.getFirstAsync(
    "SELECT department_id FROM departments WHERE department_id = ?;",
    [departmentId]
  );

  if (!existingDepartment) {
    await db.runAsync(
      "INSERT INTO departments (department_id, department_name) VALUES (?, ?);",
      [departmentId, departmentName]
    );
  }
};

const ensureBlockExists = async (db, blockId, blockName, departmentId) => {
  if (Platform.OS === "web") return;

  const existingBlock = await db.getFirstAsync(
    "SELECT block_id FROM blocks WHERE block_id = ?;",
    [blockId]
  );

  if (!existingBlock) {
    await db.runAsync(
      "INSERT INTO blocks (block_id, block_name, department_id) VALUES (?, ?, ?);",
      [blockId, blockName, departmentId]
    );
  }
};

const saveUser = async (user) => {
  if (Platform.OS === "web") return;

  const db = await initDB();

  try {
    await ensureDepartmentExists(db, user.department_id, user.department_name);
    await ensureBlockExists(
      db,
      user.block_id,
      user.block_name,
      user.department_id
    );

    const existingUser = await db.getFirstAsync(
      "SELECT id_number FROM users WHERE id_number = ?;",
      [user.id_number]
    );

    if (!existingUser) {
      await db.runAsync(
        `INSERT INTO users 
        (id_number, first_name, last_name, email, role_id, department_id, department_name, block_id, block_name, course_id, course_name) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          user.id_number,
          user.first_name,
          user.last_name,
          user.email,
          user.role_id,
          user.department_id,
          user.department_name,
          user.block_id,
          user.block_name,
          user.course_id,
          user.course_name,
        ]
      );
    }
  } catch (error) {
    console.error("Error saving user:", error);
  }
};

const getStoredUser = async () => {
  if (Platform.OS === "web") return null;

  const db = await initDB();

  try {
    const idNumber = await AsyncStorage.getItem("id_number");
    if (!idNumber) return null;

    const result = await db.getFirstAsync(
      "SELECT * FROM users WHERE id_number = ?;",
      [idNumber]
    );

    return result || null;
  } catch (error) {
    console.error("Error fetching stored user:", error);
    return null;
  }
};

const clearUser = async () => {
  if (Platform.OS === "web") return;

  const db = await initDB();
  try {
    await db.runAsync("DELETE FROM users;");
  } catch (error) {
    console.error("Error clearing user data:", error);
  }
};

const saveEvent = async (event) => {
  if (Platform.OS === "web") return;

  const db = await initDB();

  try {
    const existingEvent = await db.getFirstAsync(
      "SELECT event_id FROM events WHERE event_id = ?;",
      [event.event_id]
    );

    if (!existingEvent) {
      await db.runAsync(
        "INSERT INTO events (event_id, event_name, venue, scan_personnel, am_in, am_out, pm_in, pm_out) VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
        [
          event.event_id,
          event.event_name,
          event.venue,
          event.scan_personnel,
          event.am_in,
          event.am_out,
          event.pm_in,
          event.pm_out,
        ]
      );
    }

    if (event.event_dates && Array.isArray(event.event_dates)) {
      for (const date of event.event_dates) {
        await db.runAsync(
          "INSERT INTO event_dates (event_id, event_date) VALUES (?, ?);",
          [event.event_id, date]
        );
      }
    }
  } catch (error) {
    console.error("Error saving event:", error);
  }
};

const getStoredEvents = async () => {
  if (Platform.OS === "web") return [];

  const db = await initDB();

  try {
    const events = await db.getAllAsync("SELECT * FROM events;");

    for (const event of events) {
      const eventDates = await db.getAllAsync(
        "SELECT event_date FROM event_dates WHERE event_id = ?;",
        [event.event_id]
      );

      event.event_dates = eventDates.map((entry) => entry.event_date);
    }

    return events;
  } catch (error) {
    console.error("Error fetching stored events:", error);
    return [];
  }
};

const clearAllTables = async () => {
  if (Platform.OS === "web") return;

  const db = await initDB();

  try {
    await db.runAsync("DELETE FROM users;");
    await db.runAsync("DELETE FROM events;");
    await db.runAsync("DELETE FROM event_dates;");
    await db.runAsync("DELETE FROM blocks;");
    await db.runAsync("DELETE FROM departments;");
  } catch (error) {
    console.error("Error clearing tables:", error);
  }
};

export {
  saveUser,
  clearUser,
  saveEvent,
  getStoredEvents,
  getStoredUser,
  clearAllTables,
  initDB,
};
