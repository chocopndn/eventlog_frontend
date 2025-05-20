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
      `${API_URL}/api/attendance/admin/ongoing/events`,
      {
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

export const fetchBlocksOfEvents = async (
  eventId,
  selectedDepartment,
  selectedYearLevel,
  searchQuery = ""
) => {
  try {
    const body = {
      event_id: eventId,
    };

    if (selectedDepartment) {
      body.department_id = selectedDepartment;
    }

    if (selectedYearLevel) {
      body.year_level_id = selectedYearLevel;
    }

    if (searchQuery.trim() !== "") {
      body.search_query = searchQuery;
    }

    const response = await axios.post(
      `${API_URL}/api/attendance/events/blocks`,
      body
    );

    if (response.data.success) {
      return response.data;
    }

    throw new Error(
      response.data.message || "Failed to fetch blocks of events."
    );
  } catch (error) {
    console.error("❌ Failed to fetch blocks:", error.message);
    throw error;
  }
};

export const fetchStudentAttendanceByEventAndBlock = async (
  eventId,
  blockId,
  searchQuery = ""
) => {
  try {
    if (!eventId || !blockId) {
      throw new Error("Missing required parameters: eventId and blockId.");
    }

    const body = {
      event_id: eventId,
      block_id: blockId,
    };

    if (searchQuery.trim() !== "") {
      body.search_query = searchQuery;
    }

    const response = await axios.post(
      `${API_URL}/api/attendance/events/block/students`,
      body
    );

    if (response.data.success) {
      return response.data;
    }

    throw new Error(
      response.data.message || "Failed to fetch student attendance data."
    );
  } catch (error) {
    console.error("❌ Failed to fetch student attendance:", error.message);
    throw error;
  }
};

export const fetchAttendanceSummaryPerBlock = async (eventId, blockId) => {
  try {
    if (!eventId || !blockId) {
      throw new Error("Missing required parameters: eventId and blockId.");
    }

    const body = {
      event_id: eventId,
      block_id: blockId,
    };

    const response = await axios.post(
      `${API_URL}/api/attendance/summary`,
      body
    );

    if (response.data.success) {
      return response.data;
    }

    throw new Error(
      response.data.message || "Failed to fetch attendance summary."
    );
  } catch (error) {
    console.error("❌ Failed to fetch attendance summary:", error.message);
    throw error;
  }
};

export const getStudentAttSummary = async (eventId, studentId) => {
  try {
    if (!eventId || !studentId) {
      throw new Error("Missing required parameters: eventId and studentId.");
    }

    const body = {
      event_id: eventId,
      student_id: studentId,
    };

    console.log(body);

    const response = await axios.post(
      `${API_URL}/api/attendance/student/summary`,
      body
    );

    if (response.data.success) {
      return response.data;
    }

    throw new Error(
      response.data.message || "Failed to fetch attendance summary."
    );
  } catch (error) {
    console.error("❌ Failed to fetch attendance summary:", error.message);
    throw error;
  }
};
