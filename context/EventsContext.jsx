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

  const normalizeBlockId = (blockId) => {
    if (blockId === null || blockId === undefined) return null;
    return parseInt(blockId);
  };

  const isEventRelevantToUser = (eventBlockIds, userBlockId, userRoleId) => {
    if (userRoleId === 3 || userRoleId === 4) {
      return true;
    }

    if ((userRoleId === 1 || userRoleId === 2) && userBlockId) {
      const normalizedUserBlockId = normalizeBlockId(userBlockId);
      const normalizedEventBlockIds = (eventBlockIds || []).map((id) =>
        normalizeBlockId(id)
      );
      return normalizedEventBlockIds.includes(normalizedUserBlockId);
    }

    return false;
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
          return isEventRelevantToUser(
            event.block_ids,
            user.block_id,
            user.role_id
          );
        });
      }

      setEvents(approvedEvents);
      return approvedEvents;
    } catch (error) {
      setEvents([]);
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

    const ensureSocketConnection = () => {
      if (!socketService.socket?.connected) {
        socketService.connect();
      }
    };

    const joinAppropriateRoom = () => {
      if (!socketService.socket?.connected) {
        return false;
      }

      try {
        if (user.role_id === 3 || user.role_id === 4) {
          socketService.joinRoom("all-events");
          return true;
        } else if (
          (user.role_id === 1 || user.role_id === 2) &&
          user.block_id
        ) {
          const roomName = `block-${user.block_id}`;
          socketService.joinRoom(roomName);
          return true;
        }
      } catch (error) {}
      return false;
    };

    ensureSocketConnection();

    const connectionInterval = setInterval(() => {
      if (socketService.socket?.connected) {
        const joined = joinAppropriateRoom();
        if (joined) {
          clearInterval(connectionInterval);
        }
      } else {
        ensureSocketConnection();
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(connectionInterval);
    }, 10000);

    const handleDatabaseUpdated = async (data) => {
      if (
        data.type === "event-saved" ||
        data.type === "events-fetched-and-stored"
      ) {
        await refreshEventsFromDatabase();
      }
    };

    const handleNewApprovedEvent = async (data) => {
      const eventData = data.data || data;
      const eventBlockIds = eventData?.block_ids || [];

      if (isEventRelevantToUser(eventBlockIds, user?.block_id, user?.role_id)) {
        setTimeout(() => refreshEventsFromDatabase(), 1000);
      }
    };

    const handleNewEventAdded = async (data) => {
      const eventBlockIds = data.block_ids || [];

      if (
        isEventRelevantToUser(eventBlockIds, user?.block_id, user?.role_id) &&
        data.event?.status === "Approved"
      ) {
        setTimeout(() => refreshEventsFromDatabase(), 1000);
      }
    };

    const handleEventStatusChanged = async (data) => {
      if (data.newStatus === "Approved") {
        if (
          isEventRelevantToUser(data.block_ids, user?.block_id, user?.role_id)
        ) {
          setTimeout(() => refreshEventsFromDatabase(), 1000);
        }
      } else if (
        data.newStatus === "Pending" ||
        data.newStatus === "Rejected"
      ) {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.event_id !== data.eventId)
        );
      }
    };

    const handleUpcomingEventsUpdated = async (data) => {
      setTimeout(() => refreshEventsFromDatabase(), 500);
    };

    const handleEventsListUpdated = async (data) => {
      setTimeout(() => refreshEventsFromDatabase(), 500);
    };

    const eventTypes = [
      "database-updated",
      "newApprovedEvent",
      "new-event-added",
      "event-status-changed",
      "upcoming-events-updated",
      "events-list-updated",
    ];

    eventTypes.forEach((eventType) => {
      socketService.socket?.off(eventType);
    });

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
      clearInterval(connectionInterval);
      eventTypes.forEach((eventType) => {
        socketService.socket?.off(eventType);
      });
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
