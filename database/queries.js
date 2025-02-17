import * as SQLite from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";

let db;
const initDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("eventlog.db");
  }
  return db;
};

const saveUser = async (user) => {
  const db = await initDB();

  try {
    const existingUser = await db.getFirstAsync(
      "SELECT id_number FROM users WHERE id_number = ?;",
      [user.id_number]
    );

    if (!existingUser) {
      await db.runAsync(
        `INSERT INTO users (id_number, first_name, last_name, email, role_id, department_id, block_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          user.id_number,
          user.first_name,
          user.last_name,
          user.email,
          user.role_id,
          user.department_id,
          user.block_id,
        ]
      );
    }
  } catch (error) {
    console.error("Error saving user:", error);
  }
};

const getStoredUser = async () => {
  const db = await initDB();

  try {
    const idNumber = await AsyncStorage.getItem("id_number");
    if (!idNumber) return null;

    const result = await db.getFirstAsync(
      "SELECT * FROM users WHERE id_number = ?;",
      [idNumber]
    );

    if (!result) return null;

    return result;
  } catch (error) {
    console.error("Error fetching stored user:", error);
    return null;
  }
};

const clearUser = async () => {
  const db = await initDB();
  try {
    await db.runAsync("DELETE FROM users;");
  } catch (error) {
    console.error("Error clearing user data:", error);
  }
};

const saveEvent = async (event) => {
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
  const db = await initDB();

  try {
    const events = await db.getAllAsync("SELECT * FROM events;");

    for (const event of events) {
      const eventDates = await db.getAllAsync(
        "SELECT event_date FROM event_dates WHERE event_id = ?;",
        [event.event_id]
      );

      event.event_dates = eventDates.map((entry) => entry.event_date);

      if (event.event_dates.length === 0) {
        event.event_dates = [];
      }
    }

    return events;
  } catch (error) {
    console.error("Error fetching stored events:", error);
    return [];
  }
};

const clearAllTables = async () => {
  const db = await initDB();

  try {
    await db.runAsync("DELETE FROM users;");
    await db.runAsync("DELETE FROM events;");
    await db.runAsync("DELETE FROM event_dates;");
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
};
