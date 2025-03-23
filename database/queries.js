import { Platform } from "react-native";
import initDB from "./database";

export const storeDepartments = async (departments) => {
  if (Platform.OS === "android" || Platform.OS === "ios") {
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
