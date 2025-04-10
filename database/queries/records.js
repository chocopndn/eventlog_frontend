import { Platform } from "react-native";
import initDB from "../database";

export const saveRecords = async (records) => {
  if (Platform.OS !== "web") {
    try {
      const dbInstance = await initDB();
      if (!dbInstance) {
        throw new Error("Database initialization failed.");
      }

      const insertQuery = `
          INSERT OR IGNORE INTO records (
            event_id, event_name, event_date, am_in, am_out, pm_in, pm_out
          ) VALUES (?, ?, ?, ?, ?, ?, ?);
        `;

      await dbInstance.runAsync("BEGIN TRANSACTION");

      for (const record of records) {
        const { event_id, event_name, attendance } = record;
        const attendanceMap = attendance[0];

        for (const [event_date, attendanceData] of Object.entries(
          attendanceMap
        )) {
          const { am_in, am_out, pm_in, pm_out } = attendanceData;

          if (!event_id || !event_name || !event_date) {
            console.warn(
              `[WARN] Skipping invalid record: ${JSON.stringify(record)}`
            );
            continue;
          }

          await dbInstance.runAsync(insertQuery, [
            event_id,
            event_name,
            event_date,
            !!am_in,
            !!am_out,
            !!pm_in,
            !!pm_out,
          ]);
        }
      }

      await dbInstance.runAsync("COMMIT");

      return { success: true, message: "Records saved successfully." };
    } catch (error) {
      console.error("[SAVE RECORDS] Error saving records:", error.message);

      try {
        await dbInstance.runAsync("ROLLBACK");
      } catch (rollbackError) {
        console.error(
          "[SAVE RECORDS] Error during rollback:",
          rollbackError.message
        );
      }

      throw error;
    }
  } else {
    console.warn("[SAVE RECORDS] This function is not supported on web.");
    return {
      success: false,
      message: "This function is not supported on web.",
    };
  }
};

export const getStoredRecords = async () => {
  if (Platform.OS !== "web") {
    try {
      const dbInstance = await initDB();
      if (!dbInstance) {
        throw new Error("Database initialization failed.");
      }

      const query = `
          SELECT 
            event_id, 
            event_name, 
            event_date, 
            am_in, 
            am_out, 
            pm_in, 
            pm_out 
          FROM records;
        `;

      const records = await dbInstance.getAllAsync(query);

      return { success: true, data: records };
    } catch (error) {
      console.error(
        "[GET STORED RECORDS] Error fetching records:",
        error.message
      );
      throw error;
    }
  } else {
    console.warn("[GET STORED RECORDS] This function is not supported on web.");
    return {
      success: false,
      message: "This function is not supported on web.",
    };
  }
};
