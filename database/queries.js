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
          department_name,
          department_code,
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
        user.middle_name || null,
        user.last_name,
        user.suffix || null,
        user.email,
        user.role_id,
        user.role_name,
        user.block_id || null,
        user.block_name || null,
        user.department_id || null,
        user.department_code || null,
        user.department_name || null,
        user.course_id || null,
        user.course_name || null,
        user.course_code || null,
        user.year_level_id || null,
        user.year_level_name || null,
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
        DELETE FROM attendance;
        DELETE FROM records;
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
  if (Platform.OS === "web") {
    console.log("[storeEvent] SQLite not supported on web platform");
    return { success: false, error: "Web platform not supported" };
  }

  try {
    console.log(
      `[storeEvent] Starting to store event: ${event?.event_name} (ID: ${event?.event_id})`
    );

    // Validate inputs first
    if (!event || typeof event !== "object") {
      const error = "Invalid event object provided";
      console.error(`[storeEvent] ${error}`);
      return { success: false, error };
    }

    if (!Array.isArray(allApiEventIds)) {
      const error = "allApiEventIds must be an array";
      console.error(`[storeEvent] ${error}`);
      return { success: false, error };
    }

    if (!event.event_id) {
      const error = "Event ID is required";
      console.error(`[storeEvent] ${error}`);
      return { success: false, error };
    }

    if (event.status !== "Approved") {
      console.log(
        `[storeEvent] Event not approved, skipping: ${event.event_name}`
      );
      return { success: true, skipped: true };
    }

    // Get database instance
    console.log(`[storeEvent] Initializing database...`);
    const db = await initDB();
    if (!db) {
      const error = "Failed to initialize database";
      console.error(`[storeEvent] ${error}`);
      return { success: false, error };
    }

    console.log(`[storeEvent] Database initialized successfully`);

    // Handle cleanup if no events provided
    if (!allApiEventIds || allApiEventIds.length === 0) {
      console.log(`[storeEvent] No events provided, clearing tables...`);
      await db.runAsync("DELETE FROM event_dates");
      await db.runAsync("DELETE FROM events");
      console.log(`[storeEvent] All events cleared from database`);
      return { success: true, cleared: true };
    }

    // REMOVED: Cleanup logic to prevent conflicts when multiple events are being stored
    // Only clean up if this is explicitly requested or handle it separately

    // Check if event already exists
    console.log(`[storeEvent] Checking if event ${event.event_id} exists...`);
    const existingEvent = await db.getFirstAsync(
      "SELECT id FROM events WHERE id = ?",
      [event.event_id]
    );

    // Prepare event parameters with null handling
    const eventParams = [
      event.event_name || null,
      event.venue || null,
      event.description || null,
      event.created_by_id || null,
      event.created_by || null,
      event.status || null,
      event.am_in || null,
      event.am_out || null,
      event.pm_in || null,
      event.pm_out || null,
      event.scan_personnel || null,
      event.approved_by || null,
      event.approved_by_id || null,
      event.duration || null,
    ];

    console.log(
      `[storeEvent] Event parameters prepared for ${event.event_name}`
    );

    if (existingEvent) {
      console.log(`[storeEvent] Updating existing event: ${event.event_name}`);
      await db.runAsync(
        `UPDATE events SET 
          event_name = ?, venue = ?, description = ?, created_by_id = ?, created_by = ?, 
          status = ?, am_in = ?, am_out = ?, pm_in = ?, pm_out = ?, scan_personnel = ?, 
          approved_by = ?, approved_by_id = ?, duration = ?
        WHERE id = ?`,
        [...eventParams, event.event_id]
      );
      console.log(
        `[storeEvent] Successfully updated event: ${event.event_name}`
      );
    } else {
      console.log(`[storeEvent] Inserting new event: ${event.event_name}`);
      await db.runAsync(
        `INSERT INTO events 
          (id, event_name, venue, description, created_by_id, created_by, status, 
          am_in, am_out, pm_in, pm_out, scan_personnel, approved_by, approved_by_id, duration) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [event.event_id, ...eventParams]
      );
      console.log(
        `[storeEvent] Successfully inserted event: ${event.event_name}`
      );
    }

    // Handle event dates - IMPROVED LOGIC
    if (event.event_dates && event.event_date_ids) {
      console.log(
        `[storeEvent] Processing event dates for ${event.event_name}...`
      );
      console.log(
        `[storeEvent] Raw event_dates type:`,
        typeof event.event_dates
      );
      console.log(
        `[storeEvent] Raw event_date_ids type:`,
        typeof event.event_date_ids
      );

      let eventDatesArray = [];
      let eventDateIdsArray = [];

      // Parse event_dates - Handle both arrays and strings
      if (Array.isArray(event.event_dates)) {
        eventDatesArray = event.event_dates;
        console.log(`[storeEvent] event_dates is array:`, eventDatesArray);
      } else if (
        typeof event.event_dates === "string" &&
        event.event_dates.trim() !== ""
      ) {
        eventDatesArray = event.event_dates
          .split(",")
          .map((date) => date.trim());
        console.log(
          `[storeEvent] event_dates parsed from string:`,
          eventDatesArray
        );
      } else {
        console.log(
          `[storeEvent] event_dates is neither array nor valid string:`,
          event.event_dates
        );
      }

      // Parse event_date_ids - Handle both arrays and strings
      if (Array.isArray(event.event_date_ids)) {
        eventDateIdsArray = event.event_date_ids;
        console.log(`[storeEvent] event_date_ids is array:`, eventDateIdsArray);
      } else if (
        typeof event.event_date_ids === "string" &&
        event.event_date_ids.trim() !== ""
      ) {
        try {
          eventDateIdsArray = JSON.parse(event.event_date_ids);
          console.log(
            `[storeEvent] event_date_ids parsed from JSON:`,
            eventDateIdsArray
          );
        } catch (parseError) {
          console.error(
            `[storeEvent] Error parsing event_date_ids JSON:`,
            parseError.message
          );
          console.log(
            `[storeEvent] Continuing without event dates due to parse error`
          );
          eventDateIdsArray = [];
        }
      } else {
        console.log(
          `[storeEvent] event_date_ids is neither array nor valid string:`,
          event.event_date_ids
        );
      }

      console.log(
        `[storeEvent] Final arrays - Dates: ${eventDatesArray.length}, IDs: ${eventDateIdsArray.length}`
      );

      if (
        eventDatesArray.length > 0 &&
        eventDatesArray.length === eventDateIdsArray.length
      ) {
        console.log(
          `[storeEvent] Processing ${eventDatesArray.length} event dates...`
        );

        // Delete existing dates for this event first
        console.log(
          `[storeEvent] Deleting existing dates for event ${event.event_id}`
        );
        await db.runAsync("DELETE FROM event_dates WHERE event_id = ?", [
          event.event_id,
        ]);

        // Insert all dates for this event
        for (let i = 0; i < eventDatesArray.length; i++) {
          const eventDate = eventDatesArray[i];
          const eventDateId = eventDateIdsArray[i];

          console.log(
            `[storeEvent] Inserting date ${eventDate} with ID ${eventDateId} for event ${event.event_id}`
          );

          try {
            await db.runAsync(
              "INSERT INTO event_dates (id, event_id, event_date) VALUES (?, ?, ?)",
              [eventDateId, event.event_id, eventDate]
            );
            console.log(`[storeEvent] Successfully inserted date ${eventDate}`);
          } catch (dateError) {
            console.error(
              `[storeEvent] Error inserting date ${eventDate}:`,
              dateError.message
            );
            console.error(`[storeEvent] Date error details:`, dateError);
            // Continue with other dates even if one fails
          }
        }
        console.log(
          `[storeEvent] Successfully processed ${eventDatesArray.length} event dates for ${event.event_name}`
        );
      } else if (eventDatesArray.length !== eventDateIdsArray.length) {
        console.warn(
          `[storeEvent] Mismatch between event_dates (${eventDatesArray.length}) and event_date_ids (${eventDateIdsArray.length}) lengths for event ${event.event_name}`
        );
        console.log(
          `[storeEvent] Continuing without event dates due to mismatch`
        );
      } else {
        console.log(
          `[storeEvent] No valid event dates to process for ${event.event_name}`
        );
      }
    } else {
      console.log(
        `[storeEvent] No event dates to process for ${event.event_name} - dates or IDs missing`
      );
    }

    console.log(
      `[storeEvent] Successfully stored event: ${event.event_name} (ID: ${event.event_id})`
    );
    return { success: true };
  } catch (error) {
    const errorMessage = error.message || error.toString();
    console.error(
      `[storeEvent] Critical error storing event ${
        event?.event_name || "unknown"
      } (ID: ${event?.event_id || "unknown"}):`,
      errorMessage
    );
    console.error(`[storeEvent] Error stack:`, error.stack);
    console.error(`[storeEvent] Full error object:`, error);

    // Return detailed error information
    return {
      success: false,
      error: errorMessage,
      eventId: event?.event_id,
      eventName: event?.event_name,
    };
  }
};

// Add a separate cleanup function to handle outdated events
export const cleanupOutdatedEvents = async (allApiEventIds = []) => {
  if (Platform.OS === "web") {
    return { success: false, error: "Web platform not supported" };
  }

  try {
    console.log(`[cleanupOutdatedEvents] Starting cleanup...`);

    const db = await initDB();
    if (!db) {
      const error = "Failed to initialize database";
      console.error(`[cleanupOutdatedEvents] ${error}`);
      return { success: false, error };
    }

    if (!allApiEventIds || allApiEventIds.length === 0) {
      console.log(
        `[cleanupOutdatedEvents] No events provided, clearing all tables...`
      );
      await db.runAsync("DELETE FROM event_dates");
      await db.runAsync("DELETE FROM events");
      console.log(`[cleanupOutdatedEvents] All events cleared from database`);
      return { success: true, cleared: true };
    }

    console.log(`[cleanupOutdatedEvents] Cleaning up outdated events...`);
    const storedEvents = await db.getAllAsync("SELECT id FROM events");
    const storedEventIds = storedEvents.map((e) => e.id.toString());

    const idsToDelete = storedEventIds.filter(
      (id) => !allApiEventIds.includes(parseInt(id))
    );

    if (idsToDelete.length > 0) {
      const placeholders = idsToDelete.map(() => "?").join(",");
      await db.runAsync(
        `DELETE FROM event_dates WHERE event_id IN (${placeholders})`,
        idsToDelete
      );
      await db.runAsync(
        `DELETE FROM events WHERE id IN (${placeholders})`,
        idsToDelete
      );
      console.log(
        `[cleanupOutdatedEvents] Deleted outdated events: ${idsToDelete.join(
          ", "
        )}`
      );
    } else {
      console.log(`[cleanupOutdatedEvents] No outdated events to delete`);
    }

    return { success: true, deletedCount: idsToDelete.length };
  } catch (error) {
    console.error(`[cleanupOutdatedEvents] Error:`, error.message);
    return { success: false, error: error.message };
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
        const updateQuery = `
          UPDATE attendance
          SET ${typeColumn} = TRUE
          WHERE event_date_id = ? AND student_id_number = ?
        `;
        await dbInstance.runAsync(updateQuery, [
          attendanceData.event_date_id,
          attendanceData.student_id_number,
        ]);
      } else {
        const insertQuery = `
          INSERT INTO attendance (event_date_id, student_id_number, ${typeColumn})
          VALUES (?, ?, TRUE)
        `;
        await dbInstance.runAsync(insertQuery, [
          attendanceData.event_date_id,
          attendanceData.student_id_number,
        ]);
      }
    } catch (error) {
      throw error;
    }
  }
};

export const isAlreadyLogged = async (
  event_date_id,
  student_id_number,
  type
) => {
  if (Platform.OS !== "web") {
    try {
      const dbInstance = await initDB();
      if (!dbInstance) return false;

      const typeColumn = type.toLowerCase();

      const existingRecord = await dbInstance.getFirstAsync(
        "SELECT * FROM attendance WHERE event_date_id = ? AND student_id_number = ?",
        [event_date_id, student_id_number]
      );

      if (existingRecord && existingRecord[typeColumn]) {
        return true;
      }

      return false;
    } catch (error) {
      console.error(
        "[IS ALREADY LOGGED] Error checking attendance:",
        error.message
      );
      return false;
    }
  }
};
