import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import CollapsibleDropdown from "../../../../components/CollapsibleDropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getStoredUser,
  storeEvent,
  getStoredEvents,
  clearEventsTable,
  storeUser,
  cleanupOutdatedEvents,
} from "../../../../database/queries";
import { fetchUpcomingEvents } from "../../../../services/api";
import CustomModal from "../../../../components/CustomModal";
import NetInfo from "@react-native-community/netinfo";
import { startSync } from "../../../../services/api";
import { useFocusEffect } from "expo-router";
import { useAuth } from "../../../../context/AuthContext";
import socketService from "../../../../services/socketService";

const Home = () => {
  const { user } = useAuth();
  const [blockId, setBlockId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [userDataLoaded, setUserDataLoaded] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const canViewEvents = (userRoleId) => {
    return [1, 2, 3, 4].includes(userRoleId);
  };

  const needsSync = (userRoleId) => {
    return userRoleId === 1 || userRoleId === 2;
  };

  const refreshEventsFromDatabase = useCallback(async () => {
    try {
      const storedEvents = await getStoredEvents();
      let approvedEvents = (storedEvents || []).filter(
        (event) => event.status === "Approved"
      );
      setEvents(approvedEvents);
      return approvedEvents;
    } catch (error) {
      return [];
    }
  }, [roleId, blockId]);

  useEffect(() => {
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

    return () => {
      clearInterval(checkConnection);
    };
  }, [user?.role_id, user?.block_id]);

  useEffect(() => {
    const setupListeners = () => {
      if (!socketService.socket?.connected) {
        setTimeout(setupListeners, 1000);
        return;
      }

      const handleDatabaseUpdated = async (data) => {
        if (
          data.type === "event-saved" ||
          data.type === "events-fetched-and-stored"
        ) {
          await refreshEventsFromDatabase();
        }
      };

      const handleNewApprovedEvent = (data) => {
        const eventBlockIds = data.data?.block_ids || [];
        const userBlockId = user?.block_id;
        const userRoleId = user?.role_id;

        let isRelevantToUser = false;

        if (userRoleId === 3 || userRoleId === 4) {
          isRelevantToUser = true;
        } else if ((userRoleId === 1 || userRoleId === 2) && userBlockId) {
          isRelevantToUser =
            eventBlockIds.includes(userBlockId) ||
            eventBlockIds.includes(userBlockId?.toString()) ||
            eventBlockIds.includes(parseInt(userBlockId));
        }

        if (isRelevantToUser && data.data) {
          setModalTitle("New Event Added!");
          const message =
            userRoleId === 3 || userRoleId === 4
              ? `New event "${data.data.event_name}" has been approved and added.`
              : `New event "${data.data.event_name}" has been approved and added to your schedule.`;
          setModalMessage(data.message || message);
          setModalVisible(true);
          setTimeout(() => {
            refreshEventsFromDatabase();
          }, 1000);
        }
      };

      const handleNewEventAdded = (data) => {
        const eventBlockIds = data.block_ids || [];
        const userBlockId = user?.block_id;
        const userRoleId = user?.role_id;

        let isRelevantToUser = false;

        if (userRoleId === 3 || userRoleId === 4) {
          isRelevantToUser = true;
        } else if ((userRoleId === 1 || userRoleId === 2) && userBlockId) {
          isRelevantToUser =
            eventBlockIds.includes(userBlockId) ||
            eventBlockIds.includes(parseInt(userBlockId));
        }

        if (isRelevantToUser && data.event?.status === "Approved") {
          setModalTitle("New Event Added!");
          const message =
            userRoleId === 3 || userRoleId === 4
              ? `New event "${data.event.event_name}" has been added.`
              : `New event "${data.event.event_name}" has been added to your schedule.`;
          setModalMessage(message);
          setModalVisible(true);
          setTimeout(() => {
            refreshEventsFromDatabase();
          }, 1000);
        }
      };

      const handleEventStatusChanged = (data) => {
        const userRoleId = user?.role_id;
        const userBlockId = user?.block_id;

        if (data.newStatus === "Approved") {
          let shouldShowNotification = false;

          if (userRoleId === 3 || userRoleId === 4) {
            shouldShowNotification = true;
          } else if ((userRoleId === 1 || userRoleId === 2) && userBlockId) {
            const eventBlockIds = data.block_ids || [];
            shouldShowNotification = eventBlockIds.includes(userBlockId);
          }

          if (shouldShowNotification) {
            setModalTitle("Event Approved!");
            setModalMessage(`Event "${data.eventName}" has been approved!`);
            setModalVisible(true);
            setTimeout(() => {
              refreshEventsFromDatabase();
            }, 1000);
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

      const handleEventsListUpdated = (data) => {
        if (data.events) {
          setTimeout(() => {
            refreshEventsFromDatabase();
          }, 500);
        }
      };

      socketService.socket?.off("database-updated");
      socketService.socket?.off("newApprovedEvent");
      socketService.socket?.off("new-event-added");
      socketService.socket?.off("event-status-changed");
      socketService.socket?.off("events-list-updated");

      socketService.socket?.on("database-updated", handleDatabaseUpdated);
      socketService.socket?.on("newApprovedEvent", handleNewApprovedEvent);
      socketService.socket?.on("new-event-added", handleNewEventAdded);
      socketService.socket?.on(
        "event-status-changed",
        handleEventStatusChanged
      );
      socketService.socket?.on("events-list-updated", handleEventsListUpdated);
    };

    setupListeners();

    return () => {
      socketService.socket?.off("database-updated");
      socketService.socket?.off("newApprovedEvent");
      socketService.socket?.off("new-event-added");
      socketService.socket?.off("event-status-changed");
      socketService.socket?.off("events-list-updated");
    };
  }, [user?.block_id, user?.role_id, refreshEventsFromDatabase]);

  const fetchAndStoreUserData = async () => {
    try {
      const user = await getStoredUser();
      if (!user) {
        setUserDataLoaded(true);
        setInitialLoadComplete(true);
        return null;
      }
      setBlockId(user?.block_id || null);
      setRoleId(user?.role_id || null);
      setUserDataLoaded(true);
      return user;
    } catch (error) {
      setUserDataLoaded(true);
      setInitialLoadComplete(true);
      if (
        error.message?.includes("database") ||
        error.message?.includes("NullPointer")
      ) {
        setModalTitle("Database Error");
        setModalMessage(
          "There's an issue with local data storage. Please try restarting the app."
        );
        setModalVisible(true);
      }
      return null;
    }
  };

  const updateUserData = async (updatedUserData) => {
    try {
      const storeResult = await storeUser(updatedUserData);
      if (storeResult?.success) {
        setBlockId(updatedUserData?.block_id || null);
        setRoleId(updatedUserData?.role_id || null);
      }
    } catch (error) {
      if (error.message?.includes("database")) {
        setModalTitle("Storage Error");
        setModalMessage(
          "Unable to save user data locally. App functionality may be limited."
        );
        setModalVisible(true);
      }
    }
  };

  const fetchEvent = useCallback(
    async (currentBlockId = blockId, skipUserCheck = false) => {
      if (!skipUserCheck && !userDataLoaded) {
        return;
      }

      const currentRoleId = skipUserCheck ? user?.role_id : roleId;

      if (!canViewEvents(currentRoleId)) {
        setEvents([]);
        setInitialLoadComplete(true);
        return;
      }

      await refreshEventsFromDatabase();

      let blockIdToFetch = null;
      let timeoutTriggered = false;
      setRefreshing(true);

      const timeout = setTimeout(() => {
        timeoutTriggered = true;
        setModalTitle("Connection Issue");
        setModalMessage(
          "Fetching events is taking too long. Please check your internet connection."
        );
        setModalVisible(true);
      }, 7000);

      try {
        const response = await fetchUpcomingEvents(blockIdToFetch);

        if (!response?.success) {
          throw new Error(
            response?.message || "Failed to fetch events from API."
          );
        }

        const allEvents = response.events || [];
        const approvedEvents = allEvents.filter(
          (event) => event.status === "Approved"
        );

        if (allEvents.length === 0) {
          try {
            await clearEventsTable();
          } catch (clearError) {}
          setEvents([]);
          return;
        }

        const allApiEventIds = allEvents.map((e) => e.event_id);

        try {
          await cleanupOutdatedEvents(allApiEventIds);
        } catch (cleanupError) {}

        const storePromises = allEvents.map(async (event) => {
          try {
            const result = await storeEvent(event, allApiEventIds);
            if (result?.success) {
              return { success: true, eventId: event.event_id };
            } else {
              return {
                success: false,
                eventId: event.event_id,
                error: result?.error || "Storage failed",
              };
            }
          } catch (error) {
            return {
              success: false,
              eventId: event.event_id,
              error: error.message || "Unknown error",
            };
          }
        });

        await Promise.allSettled(storePromises);
        await refreshEventsFromDatabase();
      } catch (error) {
        try {
          const netState = await NetInfo.fetch();
          if (netState.isConnected === false) {
            setModalTitle("No Internet Connection");
            setModalMessage("You're currently offline. Showing saved events.");
          } else {
            setModalTitle("Error");
            setModalMessage(
              `Failed to fetch events: ${error.message || "Unknown error"}`
            );
          }
        } catch (netError) {
          setModalTitle("Error");
          setModalMessage(
            "An unexpected error occurred while fetching events."
          );
        }
        setModalVisible(true);
        await refreshEventsFromDatabase();
      } finally {
        clearTimeout(timeout);
        setRefreshing(false);
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
      }
    },
    [
      blockId,
      roleId,
      userDataLoaded,
      modalVisible,
      initialLoadComplete,
      user,
      refreshEventsFromDatabase,
    ]
  );

  useEffect(() => {
    const initializeApp = async () => {
      const userData = await fetchAndStoreUserData();
      await refreshEventsFromDatabase();
      setInitialLoadComplete(true);
      await fetchEvent(userData?.block_id || null, true);
    };
    initializeApp();
  }, []);

  useEffect(() => {
    if (initialLoadComplete && userDataLoaded) {
      fetchEvent();
    }
  }, [blockId, fetchEvent, initialLoadComplete, userDataLoaded]);

  const onRefresh = async () => {
    if (refreshing) return;
    await Promise.allSettled([fetchEvent(), fetchAndStoreUserData()]);
  };

  const formatTime = (timeString) => {
    if (
      !timeString ||
      typeof timeString !== "string" ||
      timeString.trim() === ""
    ) {
      return "N/A";
    }
    try {
      const trimmedTime = timeString.trim();
      if (/\b(AM|PM)\b/i.test(trimmedTime)) {
        return trimmedTime.toUpperCase();
      }
      const timeParts = trimmedTime.split(":");
      if (timeParts.length < 2) return "N/A";
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      if (
        isNaN(hours) ||
        isNaN(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        return "N/A";
      }
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes.toString().padStart(2, "0");
      return `${formattedHours}:${formattedMinutes} ${ampm}`;
    } catch (error) {
      return "N/A";
    }
  };

  const formatEventDates = (dates) => {
    try {
      const datesString = Array.isArray(dates) ? dates.join(",") : dates;
      if (!datesString || typeof datesString !== "string") {
        return "N/A";
      }
      const datesArray = datesString.split(",");
      if (datesArray.length === 0) return "N/A";
      const parsedDates = datesArray
        .map((dateStr) => new Date(dateStr))
        .filter((d) => !isNaN(d));

      if (parsedDates.length === 0) return "N/A";

      const grouped = parsedDates.reduce((acc, date) => {
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(date.getDate());
        acc[key].month = date.toLocaleString("en-US", { month: "long" });
        acc[key].year = date.getFullYear();
        return acc;
      }, {});

      const result = Object.values(grouped)
        .map((group) => {
          const days = group.sort((a, b) => a - b).join(", ");
          return `${group.month} ${days}, ${group.year}`;
        })
        .join(" & ");

      return result;
    } catch (error) {
      return "N/A";
    }
  };

  const formatEventTimes = (event) => {
    return {
      amIn: formatTime(event.am_in),
      amOut: formatTime(event.am_out),
      pmIn: formatTime(event.pm_in),
      pmOut: formatTime(event.pm_out),
    };
  };

  useFocusEffect(
    useCallback(() => {
      const performSync = async () => {
        if (userDataLoaded && roleId !== null && needsSync(roleId)) {
          try {
            const syncResult = await startSync();
            if (syncResult && syncResult.userData) {
              await updateUserData(syncResult.userData);
              setTimeout(() => {
                fetchEvent(syncResult.userData.block_id, true);
              }, 500);
            }
          } catch (syncError) {}
        }
      };
      performSync();
    }, [userDataLoaded, roleId])
  );

  const getRoleDisplayText = () => {
    switch (roleId) {
      case 1:
        return "Student";
      case 2:
        return "Officer Student";
      case 3:
        return "Administrator";
      case 4:
        return "Super Administrator";
      default:
        return "User";
    }
  };

  return (
    <SafeAreaView style={globalStyles.secondaryContainer}>
      <View>
        <View style={styles.headerContainer}>
          <Text style={styles.textHeader}>EVENTLOG</Text>
          <Text style={styles.title}>LIST OF EVENTS</Text>
          <View style={styles.line}></View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/home/Welcome")}
          style={styles.welcomeWrapper}
        >
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>WELCOME EVENTLOG USERS!</Text>
          </View>
        </TouchableOpacity>
        <ScrollView
          style={{ marginBottom: 20 }}
          contentContainerStyle={styles.scrollview}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          {!initialLoadComplete ? (
            <Text style={styles.noEventText}>Loading events...</Text>
          ) : !canViewEvents(roleId) ? (
            <Text style={styles.noEventText}>
              Your role does not have permission to view events.
            </Text>
          ) : (roleId === 1 || roleId === 2) && blockId === null ? (
            <Text style={styles.noEventText}>
              No block assigned. Please contact your administrator.
            </Text>
          ) : events.length > 0 ? (
            events.map((event, index) => {
              const eventTimes = formatEventTimes(event);
              return (
                <CollapsibleDropdown
                  key={event.event_id || index}
                  title={event.event_name || "Untitled Event"}
                  date={formatEventDates(event.event_dates)}
                  venue={event.venue || "No venue specified"}
                  am_in={eventTimes.amIn}
                  am_out={eventTimes.amOut}
                  pm_in={eventTimes.pmIn}
                  pm_out={eventTimes.pmOut}
                  personnel={event.scan_personnel || "N/A"}
                  description={event.description || "N/A"}
                />
              );
            })
          ) : (
            <Text style={styles.noEventText}>
              No approved upcoming or ongoing events found. Please check back
              later.
            </Text>
          )}
        </ScrollView>
      </View>
      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={
          modalTitle.includes("New Event") ||
          modalTitle.includes("Event Approved")
            ? "success"
            : "warning"
        }
        onClose={() => setModalVisible(false)}
        cancelTitle="CLOSE"
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  textHeader: {
    fontSize: theme.fontSizes.display,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
    textAlign: "center",
  },
  title: {
    fontSize: theme.fontSizes.huge,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
    textAlign: "center",
  },
  line: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
    width: "100%",
  },
  welcomeContainer: {
    height: 50,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginTop: theme.spacing.large,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  welcomeText: {
    fontFamily: "SquadaOne",
    fontSize: theme.fontSizes.large,
    color: theme.colors.primary,
    textAlign: "center",
  },
  scrollview: {
    marginTop: 20,
    paddingBottom: 20,
  },
  noEventText: {
    textAlign: "center",
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fontFamily.Arial,
    marginTop: 20,
    paddingHorizontal: theme.spacing.medium,
  },
  headerContainer: {
    marginTop: 20,
    paddingHorizontal: theme.spacing.medium,
  },
});
