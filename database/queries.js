import { Platform } from "react-native";
import initDB from "./database";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeDepartments = async (departments) => {
  if (Platform.OS !== "web") {
    try {
      const dbInstance = await initDB();
      if (!dbInstance) {
        return;
      }

      const insertQuery =
        "INSERT OR IGNORE INTO departments (name, code) VALUES (?, ?)";

      for (const department of departments) {
        await dbInstance.runAsync(insertQuery, [
          department.department_name,
          department.department_code,
        ]);
      }
    } catch (error) {
      console.error("Error storing departments:", error);
    }
  }
};

export const storeUser = async (user) => {
  if (Platform.OS !== "web") {
    try {
      const dbInstance = await initDB();
      if (!dbInstance) {
        return;
      }

      const insertQuery =
        "INSERT OR IGNORE INTO users (id_number, role_id, block_id, first_name, middle_name, last_name, suffix, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

      await dbInstance.runAsync(insertQuery, [
        user.id_number,
        user.role_id,
        user.block_id,
        user.first_name,
        user.middle_name,
        user.last_name,
        user.suffix,
        user.email,
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
        console.error("Database initialization failed.");
        return;
      }

      await dbInstance.execAsync(`
        DELETE FROM attendance;
        DELETE FROM event_blocks;
        DELETE FROM event_dates;
        DELETE FROM events;
        DELETE FROM event_names;
        DELETE FROM users;
        DELETE FROM blocks;
        DELETE FROM courses;
        DELETE FROM year_levels;
        DELETE FROM departments;
        DELETE FROM roles;
      `);

      console.log("All tables data cleared successfully.");
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
        console.error("id_number not found in AsyncStorage");
        return null;
      }

      const dbInstance = await initDB();
      if (!dbInstance) {
        console.error("Database initialization failed.");
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
    console.log("SQLite only supported on Android and iOS.");
    return null;
  }
};
