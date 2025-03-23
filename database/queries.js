import { Platform } from "react-native";
import initDB from "./database";

export const storeDepartments = async (departments) => {
  if (Platform.OS === "android" || Platform === "ios") {
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
  } else {
    console.log("WEB");
  }
};
