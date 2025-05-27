import React, { createContext, useContext, useEffect, useState } from "react";
import socketService from "../services/socketService";
import { getStoredEvents } from "../database/queries";
import { useAuth } from "./AuthContext";

const EventsContext = createContext();

export const EventsProvider = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const canViewEvents = (userRoleId) => {
    return [1, 2, 3, 4].includes(userRoleId);
  };

  const refreshEventsFromDatabase = async () => {
    if (!user || !canViewEvents(user.role_id)) {
      setEvents([]);
      return [];
    }

    try {
      setLoading(true);
      const storedEvents = await getStoredEvents();
      let approvedEvents = (storedEvents || []).filter(
        (event) => event.status === "Approved"
      );

      if ((user.role_id === 1 || user.role_id === 2) && user.block_id) {
        approvedEvents = approvedEvents.filter((event) => {
          const eventBlockIds = event.block_ids || [];
          return (
            eventBlockIds.includes(user.block_id) ||
            eventBlockIds.includes(user.block_id?.toString()) ||
            eventBlockIds.includes(parseInt(user.block_id))
          );
        });
      }

      setEvents(approvedEvents);
      return approvedEvents;
    } catch (error) {
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setEvents([]);
      return;
    }

    const handleDatabaseUpdated = async (data) => {
      if (data.type === "event-saved") {
        await refreshEventsFromDatabase();
      }
    };

    const handleNewApprovedEvent = async () => {
      setTimeout(() => refreshEventsFromDatabase(), 1000);
    };

    const handleNewEventAdded = async () => {
      setTimeout(() => refreshEventsFromDatabase(), 1000);
    };

    const handleEventStatusChanged = async () => {
      setTimeout(() => refreshEventsFromDatabase(), 1000);
    };

    const handleUpcomingEventsUpdated = async () => {
      setTimeout(() => refreshEventsFromDatabase(), 500);
    };

    const handleEventsListUpdated = async () => {
      setTimeout(() => refreshEventsFromDatabase(), 500);
    };

    socketService.socket?.on("database-updated", handleDatabaseUpdated);
    socketService.socket?.on("newApprovedEvent", handleNewApprovedEvent);
    socketService.socket?.on("new-event-added", handleNewEventAdded);
    socketService.socket?.on("event-status-changed", handleEventStatusChanged);
    socketService.socket?.on(
      "upcoming-events-updated",
      handleUpcomingEventsUpdated
    );
    socketService.socket?.on("events-list-updated", handleEventsListUpdated);

    refreshEventsFromDatabase();

    return () => {
      socketService.socket?.off("database-updated", handleDatabaseUpdated);
      socketService.socket?.off("newApprovedEvent", handleNewApprovedEvent);
      socketService.socket?.off("new-event-added", handleNewEventAdded);
      socketService.socket?.off(
        "event-status-changed",
        handleEventStatusChanged
      );
      socketService.socket?.off(
        "upcoming-events-updated",
        handleUpcomingEventsUpdated
      );
      socketService.socket?.off("events-list-updated", handleEventsListUpdated);
    };
  }, [user]);

  return (
    <EventsContext.Provider
      value={{
        events,
        refreshEventsFromDatabase,
        loading,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within EventsProvider");
  }
  return context;
};
