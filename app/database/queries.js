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
  } catch (error) {}
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
