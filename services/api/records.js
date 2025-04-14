import axios from "axios";
import { API_URL } from "../../config/config";

export const fetchUserOngoingEvents = async (
  idNumber,
  page = 1,
  limit = 10,
  search = ""
) => {
  try {
    if (!idNumber) {
      throw new Error("Missing required parameter: idNumber.");
    }

    const response = await axios.post(
      `${API_URL}/api/attendance/user/ongoing/events`,
      {
        id_number: idNumber,
        page,
        limit,
        search,
      }
    );

    if (response.data.success) {
      return response.data;
    }

    throw new Error(response.data.message || "Failed to fetch user events.");
  } catch (error) {
    throw error;
  }
};

export const fetchUserPastEvents = async (
  idNumber,
  page = 1,
  limit = 10,
  search = ""
) => {
  try {
    if (!idNumber) {
      throw new Error("Missing required parameter: idNumber.");
    }

    const response = await axios.post(
      `${API_URL}/api/attendance/user/past/events`,
      {
        id_number: idNumber,
        page,
        limit,
        search,
      }
    );

    if (response.data.success) {
      return response.data;
    }

    throw new Error(response.data.message || "Failed to fetch user events.");
  } catch (error) {
    throw error;
  }
};

export const fetchAllPastEvents = async (page = 1, limit = 10, search = "") => {
  try {
    const response = await axios.post(
      `${API_URL}/api/attendance/admin/past/events`,
      {
        id_number: idNumber,
        page,
        limit,
        search,
      }
    );

    if (response.data.success) {
      return response.data;
    }

    throw new Error(
      response.data.message || "Failed to fetch all past events."
    );
  } catch (error) {
    throw error;
  }
};

export const fetchAllOngoingEvents = async (
  page = 1,
  limit = 10,
  search = ""
) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/attendance/admin/past/events`,
      {
        id_number: idNumber,
        page,
        limit,
        search,
      }
    );

    if (response.data.success) {
      return response.data;
    }

    throw new Error(
      response.data.message || "Failed to fetch all ongoing events."
    );
  } catch (error) {
    throw error;
  }
};
