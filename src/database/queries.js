import { setupDatabase } from "./database";

let db;

const initDB = async () => {
  if (!db) {
    db = await setupDatabase();
  }
};

const saveUser = async (user) => {
  try {
    await initDB();

    await db.runAsync("DELETE FROM users;");

    if (!user.id_number || !user.first_name || !user.last_name || !user.email) {
      throw new Error("Invalid user data");
    }

    await db.runAsync(
      `INSERT INTO users (id_number, first_name, last_name, department_name, block_id, email, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        user.id_number,
        user.first_name,
        user.last_name,
        user.department_name || "",
        user.block_id,
        user.email,
        user.role || "Student",
      ]
    );
  } catch (error) {
    console.error("Error saving user:", error);
    throw error;
  }
};

const getStoredUser = async () => {
  try {
    await initDB();

    const user = await db.getFirstAsync("SELECT * FROM users;");
    return user || null;
  } catch (error) {
    console.error("Error fetching stored user:", error);
    return null;
  }
};

const saveEvent = async (event) => {
  try {
    await initDB();

    if (!event.event_id || !event.event_name) {
      throw new Error("Invalid event data");
    }

    const existingEvent = await db.getFirstAsync(
      `SELECT event_id FROM events WHERE event_id = ?;`,
      [event.event_id]
    );

    if (existingEvent) {
      return;
    }

    await db.runAsync(
      `INSERT INTO events 
      (event_id, event_name, venue, scan_personnel, am_in, am_out, pm_in, pm_out) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        event.event_id,
        event.event_name,
        event.venue || "",
        event.scan_personnel || "",
        event.am_in || "",
        event.am_out || "",
        event.pm_in || "",
        event.pm_out || "",
      ]
    );

    const uniqueDates = [...new Set(event.dates)];

    for (let eventDate of uniqueDates) {
      if (event.event_id && eventDate) {
        await db.runAsync(
          `INSERT INTO event_dates (event_id, event_date) VALUES (?, ?);`,
          [event.event_id, eventDate]
        );
      }
    }
  } catch (error) {
    console.error("Error saving event:", error);
    throw error;
  }
};

const getStoredEvents = async () => {
  try {
    await initDB();

    const events = await db.getAllAsync(`SELECT * FROM events;`);
    const eventDates = await db.getAllAsync(
      `SELECT event_id, event_date FROM event_dates;`
    );

    const eventMap = {};
    events.forEach((event) => {
      eventMap[event.event_id] = {
        ...event,
        dates: [],
      };
    });

    eventDates.forEach((dateEntry) => {
      if (eventMap[dateEntry.event_id]) {
        eventMap[dateEntry.event_id].dates.push(dateEntry.event_date);
      }
    });

    return Object.values(eventMap).map((event) => ({
      ...event,
      dates: [...new Set(event.dates)],
    }));
  } catch (error) {
    console.error("Error fetching stored events:", error);
    return [];
  }
};

const getEventsByDate = async (date) => {
  try {
    await initDB();
    const events = await getStoredEvents();

    return events.filter((event) => event.dates.includes(date));
  } catch (error) {
    console.error("Error fetching events by date:", error);
    return [];
  }
};

const clearUser = async () => {
  try {
    await initDB();

    await db.execAsync(`DROP TABLE IF EXISTS users;`);
    await db.execAsync(`DROP TABLE IF EXISTS events;`);
    await db.execAsync(`DROP TABLE IF EXISTS event_dates;`);

    await setupDatabase();
  } catch (error) {
    console.error("Error clearing user and resetting database:", error);
    throw error;
  }
};

export {
  saveUser,
  getStoredUser,
  clearUser,
  saveEvent,
  getStoredEvents,
  getEventsByDate,
};
