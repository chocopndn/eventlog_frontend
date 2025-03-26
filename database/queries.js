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
