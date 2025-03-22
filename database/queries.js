import initDB from "./database";

export const storeDepartments = async (departments) => {
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
};

export const getDepartments = async () => {
  try {
    const dbInstance = await initDB();
    if (!dbInstance) {
      return [];
    }
    const result = await dbInstance.getAllAsync("SELECT * FROM departments");
    return result || [];
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};
