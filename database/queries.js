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

export const storeEvent = async (event, allApiEventIds = []) => {
  try {
    const db = await initDB();
    if (!db) return;

    if (event.status !== "Approved") return;

    if (!allApiEventIds || allApiEventIds.length === 0) {
      await db.runAsync("DELETE FROM event_dates");
      await db.runAsync("DELETE FROM events");
      return;
    }

    const storedEvents = await db.getAllAsync("SELECT id FROM events");
    const storedEventIds = storedEvents.map((e) => e.id);

    const idsToDelete = storedEventIds.filter(
      (id) => !allApiEventIds.includes(id)
    );
    if (idsToDelete.length > 0) {
      await db.runAsync(
        `DELETE FROM event_dates WHERE event_id IN (${idsToDelete.join(",")})`
      );
      await db.runAsync(
        `DELETE FROM events WHERE id IN (${idsToDelete.join(",")})`
      );
    }

    const existingEvent = await db.getFirstAsync(
      "SELECT id FROM events WHERE id = ?",
      [event.event_id]
    );

    if (existingEvent) {
      await db.runAsync(
        `UPDATE events SET 
          event_name = ?, venue = ?, description = ?, created_by_id = ?, created_by = ?, 
          status = ?, am_in = ?, am_out = ?, pm_in = ?, pm_out = ?, scan_personnel = ?, 
          approved_by = ?, approved_by_id = ?, duration = ?
        WHERE id = ?`,
        [
          event.event_name,
          event.venue,
          event.description,
          event.created_by_id,
          event.created_by,
          event.status,
          event.am_in,
          event.am_out,
          event.pm_in,
          event.pm_out,
          event.scan_personnel,
          event.approved_by,
          event.approved_by_id,
          event.duration,
          event.event_id,
        ]
      );
    } else {
      await db.runAsync(
        `INSERT INTO events 
          (id, event_name, venue, description, created_by_id, created_by, status, 
          am_in, am_out, pm_in, pm_out, scan_personnel, approved_by, approved_by_id, duration) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.event_id,
          event.event_name,
          event.venue,
          event.description,
          event.created_by_id,
          event.created_by,
          event.status,
          event.am_in,
          event.am_out,
          event.pm_in,
          event.pm_out,
          event.scan_personnel,
          event.approved_by,
          event.approved_by_id,
          event.duration,
        ]
      );
    }

    if (
      typeof event.event_dates === "string" &&
      event.event_dates.trim() !== ""
    ) {
      const eventDatesArray = event.event_dates
        .split(",")
        .map((date) => date.trim());

      const existingDates = await db.getAllAsync(
        "SELECT event_date FROM event_dates WHERE event_id = ?",
        [event.event_id]
      );
      const existingDateSet = new Set(existingDates.map((e) => e.event_date));

      for (const eventDate of eventDatesArray) {
        if (!existingDateSet.has(eventDate)) {
          await db.runAsync(
            "INSERT INTO event_dates (event_id, event_date) VALUES (?, ?)",
            [event.event_id, eventDate]
          );
        }
      }
    }
  } catch (error) {}
};

export const getStoredEvents = async () => {
  if (Platform.OS === "web") return null;

  try {
    const db = await initDB();
    if (!db) return [];

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
      WHERE event.status = ?
    `;
    const events = await db.getAllAsync(eventsQuery, ["Approved"]);

    if (!events.length) return [];

    const eventIds = events.map((e) => e.event_id);

    if (eventIds.length) {
      const eventDatesQuery = `
        SELECT event_id, event_date
        FROM event_dates
        WHERE event_id IN (${eventIds.join(",")})
      `;
      const eventDates = await db.getAllAsync(eventDatesQuery);

      const eventDatesMap = {};
      for (const { event_id, event_date } of eventDates) {
        if (!eventDatesMap[event_id]) eventDatesMap[event_id] = [];
        eventDatesMap[event_id].push(event_date);
      }

      for (const event of events) {
        event.event_dates = eventDatesMap[event.event_id] || [];
      }
    }

    return events;
  } catch (error) {
    return [];
  }
};
export const clearEventsTable = async () => {
  try {
    const db = await initDB();
    if (!db) {
      console.error("[CLEAR EVENTS TABLE] Database connection failed.");
      return;
    }

    console.log(
      "[CLEAR EVENTS TABLE] Clearing events and event_dates tables..."
    );
    await db.runAsync("DELETE FROM event_dates");
    await db.runAsync("DELETE FROM events");

    console.log("[CLEAR EVENTS TABLE] Tables cleared successfully.");
  } catch (error) {
    console.error("[CLEAR EVENTS TABLE] Error clearing tables:", error);
  }
};
