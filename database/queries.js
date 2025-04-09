import { Platform } from "react-native";
import initDB from "./database";
import AsyncStorage from "@react-native-async-storage/async-storage";
let isTransactionInProgress = false;

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
          course_code,
          year_level_id,
          year_level_name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        user.course_code,
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
        "SELECT id_number, first_name, middle_name, last_name, suffix, email, role_id, role_name, block_id, block_name, department_id, department_name, department_code, course_id, course_name, year_level_id, year_level_name, course_code FROM users WHERE id_number = ?",
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

    if (!event || typeof event !== "object") return;
    if (!Array.isArray(allApiEventIds)) return;

    if (event.status !== "Approved") return;

    if (!allApiEventIds || allApiEventIds.length === 0) {
      await db.runAsync("DELETE FROM event_dates");
      await db.runAsync("DELETE FROM events");
      return;
    }

    const storedEvents = await db.getAllAsync("SELECT id FROM events");
    const storedEventIds = storedEvents.map((e) => e.id.toString());

    const idsToDelete = storedEventIds.filter(
      (id) => !allApiEventIds.includes(id)
    );

    if (idsToDelete.length > 0) {
      await db.runAsync(
        `DELETE FROM event_dates WHERE event_id IN (${idsToDelete
          .map(() => "?")
          .join(",")})`,
        idsToDelete
      );
      await db.runAsync(
        `DELETE FROM events WHERE id IN (${idsToDelete
          .map(() => "?")
          .join(",")})`,
        idsToDelete
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

    if (event.event_dates && event.event_date_ids) {
      let eventDatesArray = [];
      let eventDateIdsArray = [];

      if (
        typeof event.event_dates === "string" &&
        event.event_dates.trim() !== ""
      ) {
        eventDatesArray = event.event_dates
          .split(",")
          .map((date) => date.trim());
      } else if (Array.isArray(event.event_dates)) {
        eventDatesArray = event.event_dates;
      }

      if (
        typeof event.event_date_ids === "string" &&
        event.event_date_ids.trim() !== ""
      ) {
        eventDateIdsArray = JSON.parse(event.event_date_ids);
      } else if (Array.isArray(event.event_date_ids)) {
        eventDateIdsArray = event.event_date_ids;
      }

      if (eventDatesArray.length === eventDateIdsArray.length) {
        const existingDates = await db.getAllAsync(
          "SELECT id, event_date FROM event_dates WHERE event_id = ?",
          [event.event_id]
        );
        const existingDateMap = new Map(
          existingDates.map((e) => [e.event_date, e.id])
        );

        for (let i = 0; i < eventDatesArray.length; i++) {
          const eventDate = eventDatesArray[i];
          const eventDateId = eventDateIdsArray[i];

          if (existingDateMap.has(eventDate)) {
            await db.runAsync(
              "UPDATE event_dates SET id = ? WHERE event_id = ? AND event_date = ?",
              [eventDateId, event.event_id, eventDate]
            );
          } else {
            await db.runAsync(
              "INSERT OR IGNORE INTO event_dates (id, event_id, event_date) VALUES (?, ?, ?)",
              [eventDateId, event.event_id, eventDate]
            );
          }
        }
      } else {
        console.error(
          "Mismatch between event_dates and event_date_ids lengths"
        );
      }
    }
  } catch (error) {
    console.error("Error storing event:", error.message);
  }
};

export const getStoredEvents = async () => {
  if (Platform.OS === "web") return null;

  try {
    const db = await initDB();
    if (!db) return [];

    const eventsQuery = `
      SELECT
        event.id AS event_id,
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
        SELECT event_id, event_date, id AS event_date_id
        FROM event_dates
        WHERE event_id IN (${eventIds.join(",")})
      `;
      const eventDates = await db.getAllAsync(eventDatesQuery);

      const eventDatesMap = {};
      for (const { event_id, event_date, event_date_id } of eventDates) {
        if (!eventDatesMap[event_id]) {
          eventDatesMap[event_id] = {
            event_dates: [],
            event_date_ids: [],
          };
        }
        eventDatesMap[event_id].event_dates.push(event_date);
        eventDatesMap[event_id].event_date_ids.push(event_date_id);
      }

      for (const event of events) {
        const eventData = eventDatesMap[event.event_id] || {
          event_dates: [],
          event_date_ids: [],
        };
        event.event_dates = eventData.event_dates;
        event.event_date_ids = eventData.event_date_ids;
      }
    }

    return events;
  } catch (error) {
    console.error("[GET STORED EVENTS] Error fetching events:", error.message);
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

    await db.runAsync("DELETE FROM event_dates");
    await db.runAsync("DELETE FROM events");
  } catch (error) {
    console.error("[CLEAR EVENTS TABLE] Error clearing tables:", error);
  }
};

export const logAttendance = async (attendanceData) => {
  if (Platform.OS !== "web") {
    try {
      const dbInstance = await initDB();
      if (!dbInstance) return;

      await dbInstance.runAsync(`
        CREATE TABLE IF NOT EXISTS attendance (
          event_date_id INTEGER PRIMARY KEY,
          student_id_number INTEGER NOT NULL,
          am_in BOOLEAN DEFAULT FALSE,
          am_out BOOLEAN DEFAULT FALSE,
          pm_in BOOLEAN DEFAULT FALSE,
          pm_out BOOLEAN DEFAULT FALSE
        )
      `);

      const existingRecord = await dbInstance.getFirstAsync(
        "SELECT * FROM attendance WHERE event_date_id = ? AND student_id_number = ?",
        [attendanceData.event_date_id, attendanceData.student_id_number]
      );

      const typeColumn = attendanceData.type.toLowerCase();

      const typeDescriptions = {
        AM_IN: "Morning Time In",
        AM_OUT: "Morning Time Out",
        PM_IN: "Afternoon Time In",
        PM_OUT: "Afternoon Time Out",
      };

      const typeDescription = typeDescriptions[attendanceData.type];

      if (existingRecord) {
        if (existingRecord[typeColumn]) {
          throw new Error(
            `Attendance for ${typeDescription} has already been logged.`
          );
        }

        let updateQuery = `
          UPDATE attendance
          SET ${typeColumn} = TRUE
          WHERE event_date_id = ? AND student_id_number = ?
        `;
        await dbInstance.runAsync(updateQuery, [
          attendanceData.event_date_id,
          attendanceData.student_id_number,
        ]);
      } else {
        let insertQuery = `
          INSERT INTO attendance (event_date_id, student_id_number, ${typeColumn})
          VALUES (?, ?, TRUE)
        `;
        await dbInstance.runAsync(insertQuery, [
          attendanceData.event_date_id,
          attendanceData.student_id_number,
        ]);
      }
    } catch (error) {
      console.error(
        `[LOG ATTENDANCE] Error logging attendance: ${error.message}`
      );
      throw error;
    }
  }
};
