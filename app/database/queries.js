import { setupDatabase } from "./database";

let db;

const initDB = async () => {
  if (!db) {
    db = await setupDatabase();
  }
};

export const saveUser = async (user) => {
  try {
    await initDB();
    await db.runAsync("DELETE FROM users;");

    if (user.role === "Student" || user.role === "Officer") {
      await db.runAsync(
        `INSERT INTO users (id_number, first_name, last_name, department_id, block_id, email, role) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id_number,
          user.first_name,
          user.last_name,
          user.department_id,
          user.block_id,
          user.email,
          user.role,
        ]
      );
    }
  } catch (error) {
    throw error;
  }
};

export const getStoredUser = async () => {
  try {
    await initDB();
    const user = await db.getFirstAsync("SELECT * FROM users;");
    return user || null;
  } catch (error) {
    throw error;
  }
};

export const clearUser = async () => {
  try {
    await initDB();
    await db.runAsync("DELETE FROM users;");
  } catch (error) {
    throw error;
  }
};

export const saveEvent = async (event) => {
  try {
    await initDB();

    if (!event.event_ids || !Array.isArray(event.event_ids)) {
      return;
    }

    await db.runAsync("DELETE FROM events WHERE event_name_id = ?;", [
      event.event_name_id,
    ]);

    for (const event_id of event.event_ids) {
      await db.runAsync(
        `INSERT OR REPLACE INTO events 
        (event_id, event_name_id, event_name, venue, scan_personnel, event_dates, am_in, am_out, pm_in, pm_out) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          parseInt(event_id, 10),
          parseInt(event.event_name_id, 10),
          String(event.event_name),
          String(event.venue),
          String(event.scan_personnel),
          String(event.event_dates),
          event.am_in ? String(event.am_in) : null,
          event.am_out ? String(event.am_out) : null,
          event.pm_in ? String(event.pm_in) : null,
          event.pm_out ? String(event.pm_out) : null,
        ]
      );
    }
  } catch (error) {
    throw error;
  }
};

export const getStoredEvents = async () => {
  try {
    await initDB();
    const events = await db.getAllAsync("SELECT * FROM events;");
    return events || [];
  } catch (error) {
    throw error;
  }
};
