import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import socketService from "../services/socketService";
import { getStoredEvents } from "../database/queries";
import { useAuth } from "./AuthContext";

const EventsContext = createContext();

export const EventsProvider = ({ children }) => {
  const { user, showGlobalModal, isLoading: authLoading } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const refreshTimeoutRef = useRef(null);
  const updateNotificationTimeoutRef = useRef(null);
  const [lastEventUpdate, setLastEventUpdate] = useState(0);

  const notifyEventUpdate = useCallback(() => {
    if (updateNotificationTimeoutRef.current) {
      clearTimeout(updateNotificationTimeoutRef.current);
    }
    updateNotificationTimeoutRef.current = setTimeout(() => {
      setLastEventUpdate(Date.now());
    }, 2000);
  }, []);

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

  const debouncedRefresh = useCallback(() => {
    if (updateNotificationTimeoutRef.current) {
      clearTimeout(updateNotificationTimeoutRef.current);
    }
    updateNotificationTimeoutRef.current = setTimeout(() => {
      updateNotificationTimeoutRef.current = null;
      refreshEventsFromDatabase();
    }, 1000);
  }, []);

  const debouncedAPIFetch = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(async () => {
      refreshTimeoutRef.current = null;
      await fetchAndStoreEvents();
    }, 2000);
  }, []);

  const refreshEventsFromDatabase = useCallback(async () => {
    if (!user || !canViewEvents(user.role_id)) {
      if (user === null && events.length > 0) {
        setEvents([]);
      } else if (user === undefined) {
        return events;
      }
      return [];
    }
    try {
      setLoading(true);
      const storedEvents = await getStoredEvents();
      let approvedEvents = (storedEvents || []).filter(
        (event) => event.status === "Approved"
      );
      setEvents(approvedEvents);
      return approvedEvents;
    } catch (error) {
      return events;
    } finally {
      setLoading(false);
    }
  }, [user, events]);

  const fetchAndStoreEvents = useCallback(async () => {
    if (!user) return;
    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      return;
    }
    setLastFetchTime(now);
    try {
      const { fetchUpcomingEvents } = await import("../services/api");
      const { storeEvent, clearEventsTable, cleanupOutdatedEvents } =
        await import("../database/queries");
      let blockIdToFetch = null;
      if ((user.role_id === 1 || user.role_id === 2) && user.block_id) {
        blockIdToFetch = user.block_id;
      }
      const response = await fetchUpcomingEvents(blockIdToFetch);
      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to fetch events from API."
        );
      }
      const allEvents = response.events || [];
      if (allEvents.length === 0) {
        try {
          await clearEventsTable();
        } catch (clearError) {}
        await refreshEventsFromDatabase();
        return;
      }
      const allApiEventIds = allEvents.map((e) => e.event_id);
      try {
        await cleanupOutdatedEvents(allApiEventIds);
      } catch (cleanupError) {}
      const storePromises = allEvents.map(async (event) => {
        try {
          const result = await storeEvent(event, allApiEventIds);
          return result?.success
            ? { success: true, eventId: event.event_id }
            : { success: false, eventId: event.event_id };
        } catch (error) {
          return {
            success: false,
            eventId: event.event_id,
            error: error.message,
          };
        }
      });
      await Promise.allSettled(storePromises);
      await refreshEventsFromDatabase();
    } catch (error) {
      await refreshEventsFromDatabase();
    }
  }, [user?.role_id, user?.block_id, lastFetchTime]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (user === null) {
      setEvents([]);
      return;
    }

    if (user === undefined) {
      return;
    }

    refreshEventsFromDatabase();

    socketService.connect();

    if (user?.role_id === 3 || user?.role_id === 4) {
      socketService.joinRoom("all-events");
    } else if ((user?.role_id === 1 || user?.role_id === 2) && user?.block_id) {
      socketService.joinRoom(`block-${user.block_id}`);
    }

    const checkConnection = setInterval(() => {
      if (socketService.socket?.connected) {
        clearInterval(checkConnection);
        if (user?.role_id === 3 || user?.role_id === 4) {
          socketService.joinRoom("all-events");
        } else if (
          (user?.role_id === 1 || user?.role_id === 2) &&
          user?.block_id
        ) {
          socketService.joinRoom(`block-${user.block_id}`);
        }
      } else {
        socketService.connect();
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(checkConnection);
    }, 10000);

    const handleDatabaseUpdated = async (data) => {
      if (
        data.type === "event-saved" ||
        data.type === "events-fetched-and-stored"
      ) {
        debouncedRefresh();
      }
    };

    const handleNewApprovedEvent = async (data) => {
      const eventData = data.data || data;
      const eventBlockIds = eventData?.block_ids || [];
      if (isEventRelevantToUser(eventBlockIds, user?.block_id, user?.role_id)) {
        setLastEventUpdate(Date.now());
      }
    };

    const handleNewEventAdded = async (data) => {
      const eventBlockIds = data.block_ids || [];
      if (
        isEventRelevantToUser(eventBlockIds, user?.block_id, user?.role_id) &&
        data.event?.status === "Approved"
      ) {
        setLastEventUpdate(Date.now());
      }
    };

    const handleEventStatusChanged = async (data) => {
      if (data.newStatus === "Approved") {
        if (
          isEventRelevantToUser(data.block_ids, user?.block_id, user?.role_id)
        ) {
          setLastEventUpdate(Date.now());
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

    const handleEventsListUpdated = async (data) => {
      setLastEventUpdate(Date.now());
    };

    const eventTypes = [
      "database-updated",
      "newApprovedEvent",
      "new-event-added",
      "event-status-changed",
      "events-list-updated",
    ];

    eventTypes.forEach((eventType) => {
      socketService.socket?.off(eventType);
    });

    socketService.socket?.on("database-updated", handleDatabaseUpdated);
    socketService.socket?.on("newApprovedEvent", handleNewApprovedEvent);
    socketService.socket?.on("new-event-added", handleNewEventAdded);
    socketService.socket?.on("event-status-changed", handleEventStatusChanged);
    socketService.socket?.on("events-list-updated", handleEventsListUpdated);

    return () => {
      clearInterval(checkConnection);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      eventTypes.forEach((eventType) => {
        socketService.socket?.off(eventType);
      });
    };
  }, [authLoading, user?.role_id, user?.block_id, user]);

  return (
    <EventsContext.Provider
      value={{
        events,
        refreshEventsFromDatabase,
        loading,
        fetchAndStoreEvents,
        lastEventUpdate,
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
