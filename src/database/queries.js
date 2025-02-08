import * as SQLite from "expo-sqlite";

let db;

const initDB = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("eventlog.db");
  }
  return db;
};

const saveUser = async (user) => {
  if (!user.id_number || !user.first_name || !user.last_name || !user.email) {
    return;
  }

  const db = await initDB();
  await db.runAsync("DELETE FROM users;");
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
};

const getStoredUser = async () => {
  const db = await initDB();
  return await db.getFirstAsync("SELECT * FROM users;");
};

const clearUser = async () => {
  const db = await initDB();
  await db.runAsync("DELETE FROM users;");
};

const saveEvent = async (event) => {
  if (!event.event_id || !event.event_name) {
    return;
  }

  const db = await initDB();
  await db.runAsync(
    `INSERT OR REPLACE INTO events 
     (event_id, event_name, venue, scan_personnel, am_in, am_out, pm_in, pm_out) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      event.event_id,
      event.event_name,
      event.venue || "",
      event.scan_personnel || "",
      event.am_in || null,
      event.am_out || null,
      event.pm_in || null,
      event.pm_out || null,
    ]
  );

  if (Array.isArray(event.dates)) {
    for (let eventDate of event.dates) {
      await db.runAsync(
        `INSERT OR IGNORE INTO event_dates (event_id, event_date) VALUES (?, ?);`,
        [event.event_id, eventDate]
      );
    }
  }
};

const getStoredEvents = async () => {
  const db = await initDB();
  const events = await db.getAllAsync(`SELECT * FROM events;`);
  const eventDates = await db.getAllAsync(
    `SELECT event_id, event_date FROM event_dates;`
  );

  const eventMap = {};
  events.forEach((event) => {
    eventMap[event.event_id] = { ...event, dates: [] };
  });

  eventDates.forEach(({ event_id, event_date }) => {
    if (eventMap[event_id]) {
      eventMap[event_id].dates.push(event_date);
    }
  });

  return Object.values(eventMap);
};

const removeEvent = async (event_id) => {
  const db = await initDB();
  await db.runAsync("DELETE FROM events WHERE event_id = ?;", [event_id]);
  await db.runAsync("DELETE FROM event_dates WHERE event_id = ?;", [event_id]);
};

const syncDatabaseWithAPI = async (apiEvents) => {
  if (!Array.isArray(apiEvents)) return;

  const db = await initDB();
  await db.runAsync("BEGIN TRANSACTION;");

  const storedEvents = await getStoredEvents();
  const storedEventIds = new Set(storedEvents.map((e) => e.event_id));
  const apiEventIds = new Set(apiEvents.map((e) => e.event_id));

  for (const event of storedEvents) {
    if (!apiEventIds.has(event.event_id)) {
      await db.runAsync("DELETE FROM events WHERE event_id = ?;", [
        event.event_id,
      ]);
      await db.runAsync("DELETE FROM event_dates WHERE event_id = ?;", [
        event.event_id,
      ]);
    }
  }

  for (const event of apiEvents) {
    await saveEvent(event);
  }

  await db.runAsync("COMMIT;");
};

const getEventsByDate = async (date) => {
  const db = await initDB();
  const events = await getStoredEvents();
  return events.filter((event) => event.dates.includes(date));
};

const clearEventsTable = async () => {
  const db = await initDB();
  await db.runAsync("DELETE FROM events;");
  await db.runAsync("DELETE FROM event_dates;");
};

export {
  saveUser,
  getStoredUser,
  clearUser,
  saveEvent,
  getStoredEvents,
  getEventsByDate,
  removeEvent,
  syncDatabaseWithAPI,
  clearEventsTable,
};
