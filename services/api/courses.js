import axios from "axios";
import { API_URL } from "../../config/config";

export const fetchCoursesByDepartmentId = async (departmentId) => {
  try {
    if (!departmentId || isNaN(departmentId)) {
      throw new Error("Invalid department ID provided");
    }

    const response = await axios.get(
      `${API_URL}/api/courses/departments/${departmentId}`
    );

    if (response.data.success) {
      return response.data.courses;
    }

    throw new Error(
      response.data.message || "Failed to fetch courses by department ID"
    );
  } catch (error) {
    console.error("Error fetching courses by department ID:", error.message);
    throw error;
  }
};
