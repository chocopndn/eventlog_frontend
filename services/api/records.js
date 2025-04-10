import axios from "axios";
import { API_URL } from "../../config/config";

export const fetchUserEvents = async (idNumber, page = 1, limit = 10) => {
  try {
    if (!idNumber) {
      throw new Error("Missing required parameter: idNumber.");
    }

    const response = await axios.post(`${API_URL}/api/attendance/user/events`, {
      id_number: idNumber,
      page,
      limit,
    });

    if (response.data.success) {
      return response.data;
    }

    throw new Error(response.data.message || "Failed to fetch user events.");
  } catch (error) {
    console.error("Error fetching user events:", error.message || error);

    throw error;
  }
};
