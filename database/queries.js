import { Platform } from "react-native";
import initDB from "./database";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeUser = async (user) => {
  if (Platform.OS !== "web") {
    try {
      const dbInstance = await initDB();
      if (!dbInstance) {
        return;
      }

      const insertQuery = `
        INSERT OR REPLACE INTO users (
          id_number,
          first_name,
          middle_name,
          last_name,
          suffix,
          email,
          role_id,
          role_name,
          block_id,
          block_name,
          department_id,
          department_code,
          department_name,
          course_id,
          course_name,
          year_level_id,
          year_level_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await dbInstance.runAsync(insertQuery, [
        user.id_number,
        user.first_name,
        user.middle_name,
        user.last_name,
        user.suffix,
        user.email,
        user.role_id,
        user.role_name,
        user.block_id,
        user.block_name,
        user.department_id,
        user.department_code,
        user.department_name,
        user.course_id,
        user.course_name,
        user.year_level_id,
        user.year_level_name,
      ]);
    } catch (error) {
      console.error("Error storing user", error);
    }
  }
};

export const clearAllTablesData = async () => {
  if (Platform.OS !== "web") {
    try {
      const dbInstance = await initDB();
      if (!dbInstance) {
        return;
      }

      await dbInstance.execAsync(`
        DELETE FROM users;
        DELETE FROM events;
        DELETE FROM event_dates;
      `);
    } catch (error) {
      console.error("Error clearing all tables data:", error);
    }
  }
};

export const getRoleID = async () => {
  if (Platform.OS !== "web") {
    try {
      const idNumber = await AsyncStorage.getItem("id_number");
      if (!idNumber) {
        return null;
      }

      const dbInstance = await initDB();
      if (!dbInstance) {
        return null;
      }

      const result = await dbInstance.getFirstAsync(
        "SELECT role_id FROM users WHERE id_number = ?",
        [idNumber]
      );
      return result?.role_id;
    } catch (error) {
      console.error("Error getting role ID:", error);
      return null;
    }
  } else {
    return null;
  }
};

export const getStoredUser = async () => {
  if (Platform.OS !== "web") {
    try {
      const idNumber = await AsyncStorage.getItem("id_number");

      if (!idNumber) {
        return null;
      }

      const dbInstance = await initDB();
      if (!dbInstance) {
        return null;
      }

      const result = await dbInstance.getFirstAsync(
        "SELECT id_number, first_name, middle_name, last_name, suffix, email, role_id, role_name, block_id, block_name, department_id, department_name, department_code, course_id, course_name, year_level_id, year_level_name FROM users WHERE id_number = ?",
        [idNumber]
      );
      return result;
    } catch (error) {
      console.error("Error getting stored user:", error);
      return null;
    }
  } else {
    return null;
  }
};

export const storeEvent = async (event) => {
  if (!event || !event.event_id) {
    console.error("Invalid event data:", event);
    return;
  }

  try {
    const db = await initDB();
    if (!db) {
      console.error("Database failed to open.");
      return;
    }

    const existingEvent = await db.getFirstAsync(
      "SELECT id FROM events WHERE id = ?",
      [event.event_id]
    );

    if (!existingEvent) {
      await db.runAsync(
        `INSERT INTO events (
          id, event_name, venue, description, created_by_id, created_by, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          event.event_id,
          event.event_name,
          event.venue,
          event.description,
          event.created_by_id,
          event.created_by,
          event.status,
        ]
      );
    } else {
    }

    if (Array.isArray(event.event_dates)) {
      for (const eventDate of event.event_dates) {
        const existingDate = await db.getFirstAsync(
          "SELECT id FROM event_dates WHERE event_id = ? AND event_date = ?",
          [event.event_id, eventDate]
        );

        if (!existingDate) {
          await db.runAsync(
            "INSERT INTO event_dates (event_id, event_date) VALUES (?, ?)",
            [event.event_id, eventDate]
          );
        }
      }
    }
  } catch (error) {
    console.error("Error storing event:", error);
  }
};

export const getStoredEvents = async () => {
  if (Platform.OS !== "web") {
    try {
      const dbInstance = await initDB();
      if (!dbInstance) {
        return null;
      }

      const eventsQuery = `
        SELECT
          event.id AS event_id,
          event.event_name_id,
          event.event_name,
          event.venue,
          event.description,
          event.scan_personnel,
          event.status,
          event.created_by_id,
          event.created_by,
          event.approved_by_id,
          event.approved_by,
          event.am_in,
          event.am_out,
          event.pm_in,
          event.pm_out,
          event.duration
        FROM events event
      `;
      const events = await dbInstance.getAllAsync(eventsQuery);

      for (let event of events) {
        const eventDatesQuery = `
          SELECT ed.event_date
          FROM event_dates ed
          WHERE ed.event_id = ?
        `;
        const eventDates = await dbInstance.getAllAsync(eventDatesQuery, [
          event.event_id,
        ]);

        event.event_dates = eventDates.map((date) => date.event_date);
      }

      return events;
    } catch (error) {
      console.error("Error getting stored events:", error);
      return null;
    }
  } else {
    return null;
  }
};
