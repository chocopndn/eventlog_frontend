import axios from "axios";
import { API_URL } from "../config/config";

export const fetchEventById = async (eventId) => {
  try {
    const response = await axios.get(`${API_URL}/api/events/${eventId}`);
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
    const response = await axios.get(`${API_URL}/api/departments`);
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
      `${API_URL}/api/events/${eventId}`,
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
