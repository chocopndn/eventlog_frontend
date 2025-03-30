import axios from "axios";
import { API_URL } from "../config/config";

export const fetchEventById = async (eventId) => {
  try {
    const response = await axios.get(`${API_URL}/api/events/events/${eventId}`);
    if (response.data.success) {
      return response.data.event;
    }
    throw new Error("Failed to fetch event details");
  } catch (error) {
    throw error;
  }
};

export const fetchDepartments = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/departments/departments`);
    if (response.data.success) {
      return response.data.departments.map((dept) => ({
        label: dept.department_code,
        value: dept.department_id,
      }));
    }
    throw new Error("Failed to fetch departments");
  } catch (error) {
    throw error;
  }
};

export const fetchBlocksByDepartment = async (departmentIds) => {
  if (departmentIds.length === 0) return [];

  try {
    const responses = await Promise.all(
      departmentIds.map((deptId) =>
        axios.get(`${API_URL}/api/blocks/${deptId}`)
      )
    );

    return responses.flatMap((res) =>
      res.data.success
        ? res.data.data.map((block) => ({
            label: block.name,
            value: block.id,
          }))
        : []
    );
  } catch (error) {
    throw error;
  }
};

export const fetchEventNames = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/events/names`);

    if (response.data.success) {
      return response.data.eventNames.map((event) => ({
        label: event.name || event.event_name,
        value: event.id || event.event_name_id,
      }));
    }
    throw new Error("Failed to fetch event names");
  } catch (error) {
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/events/admin/edit/${eventId}`,
      eventData
    );
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || "Update failed");
  } catch (error) {
    throw error;
  }
};

export const fetchApprovedOngoing = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/events/approved-ongoing`);

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error("Failed to fetch approved ongoing events");
    }
  } catch (error) {
    console.error(
      "Error fetching approved ongoing events:",
      error.message || error
    );
    throw error;
  }
};

export const fetchUserUpcomingEvents = async (blockId) => {
  try {
    const response = await axios.post(`${API_URL}/api/events/user/upcoming`, {
      block_id: blockId,
    });

    if (response.data.success) {
      return response.data;
    }
    throw new Error("Failed to fetch user upcoming events");
  } catch (error) {
    throw error;
  }
};

export const fetchAdmins = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/admins`);
    if (response.data.success) {
      return response.data.admins;
    }
    throw new Error("Failed to fetch admins");
  } catch (error) {
    throw error;
  }
};

export const addAdmin = async (adminData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/admins/add-admin`,
      adminData
    );
    if (response.data.success) {
      return response.data;
    }
    console.log(response.data);

    throw new Error(response.data.message || "Failed to add admin");
  } catch (error) {
    throw error;
  }
};

export const editAdmin = async (id_number, adminData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/admins/edit/${id_number}`,
      adminData
    );
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to update admin");
  } catch (error) {
    throw error;
  }
};

export const fetchAdminById = async (id_number) => {
  try {
    const response = await axios.get(`${API_URL}/api/admins/${id_number}`);
    if (response.data.success) {
      return response.data.admin;
    }
    throw new Error(response.data.message || "Failed to fetch admin details");
  } catch (error) {
    throw error;
  }
};

export const deleteAdmin = async (id_number) => {
  try {
    const response = await axios.delete(`${API_URL}/api/admins/${id_number}`);
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || "Failed to delete admin");
  } catch (error) {
    throw error;
  }
};
