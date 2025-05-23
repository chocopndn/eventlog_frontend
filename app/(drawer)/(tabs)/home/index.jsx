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

const Home = () => {
  const [blockId, setBlockId] = useState(null);
  const [roleId, setRoleId] = useState(null);
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  const fetchAndStoreUserData = async () => {
    try {
      console.log("[Home] Fetching user data from local storage...");

      const user = await getStoredUser();
      if (!user) {
        console.warn("[Home] No stored user found.");
        setUserDataLoaded(true);
        return;
      }

      console.log("[Home] Stored user fetched:", user);
      setBlockId(user?.block_id || null);
      setRoleId(user?.role_id || null);
      setUserDataLoaded(true);
    } catch (error) {
      console.error("[Home] Error fetching user data:", error.message || error);

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

      setUserDataLoaded(true);
    }
  };

  const updateUserData = async (updatedUserData) => {
    try {
      console.log("[Home] Updating user data...");
      const storeResult = await storeUser(updatedUserData);

      if (storeResult?.success) {
        console.log("[Home] User data updated successfully");
        setBlockId(updatedUserData?.block_id || null);
        setRoleId(updatedUserData?.role_id || null);
      } else {
        console.error(
          "[Home] Failed to store user data:",
          storeResult?.error || "Unknown error"
        );
      }
    } catch (error) {
      console.error("[Home] Error updating user data:", error);

      if (error.message?.includes("database")) {
        setModalTitle("Storage Error");
        setModalMessage(
          "Unable to save user data locally. App functionality may be limited."
        );
        setModalVisible(true);
      }
    }
  };

  useEffect(() => {
    fetchAndStoreUserData();
  }, []);

  const fetchEvent = async () => {
    let timeoutTriggered = false;

    setRefreshing(true);

    console.log("[Home] Starting event fetch...");

    const timeout = setTimeout(() => {
      timeoutTriggered = true;
      console.warn("[Home] Fetch timeout: Taking too long (>7s).");
      setModalTitle("Connection Issue");
      setModalMessage(
        "Fetching events is taking too long. Please check your internet connection."
      );
      setModalVisible(true);
    }, 7000);

    try {
      console.log("[Home] Calling fetchUpcomingEvents with blockId:", blockId);
      const response = await fetchUpcomingEvents(blockId);
      console.log(response);

      console.log("EVENTS", response);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to fetch events from API."
        );
      }

      console.log(
        "[Home] Fetched events from API:",
        response.events.length,
        "event(s)"
      );

      if (response.events.length === 0) {
        console.log("[Home] No upcoming events. Clearing local events table.");
        try {
          await clearEventsTable();
        } catch (clearError) {
          console.error("[Home] Error clearing events table:", clearError);
        }
        setEvents([]);
        return;
      }

      const allApiEventIds = response.events.map((e) => e.event_id);
      console.log("[Home] Storing events locally...", allApiEventIds);

      try {
        const cleanupResult = await cleanupOutdatedEvents(allApiEventIds);
        if (cleanupResult.success) {
          console.log(
            `[Home] Cleanup completed: ${
              cleanupResult.deletedCount || 0
            } outdated events removed`
          );
        } else {
          console.warn(`[Home] Cleanup failed: ${cleanupResult.error}`);
        }
      } catch (cleanupError) {
        console.error("[Home] Error during cleanup:", cleanupError.message);
      }

      const storePromises = response.events.map(async (event) => {
        try {
          const result = await storeEvent(event, allApiEventIds);
          if (result?.success) {
            console.log(
              `[Home] Event stored successfully: ${event.event_name} (ID: ${event.event_id})`
            );
            return { success: true, eventId: event.event_id };
          } else {
            console.error(
              `[Home] Event storage failed for ID ${event.event_id}:`,
              result?.error || "Unknown error"
            );
            return {
              success: false,
              eventId: event.event_id,
              error: result?.error || "Storage failed",
            };
          }
        } catch (error) {
          console.error(
            `[Home] Critical error storing event ID ${event.event_id}:`,
            error.message || error
          );
          return {
            success: false,
            eventId: event.event_id,
            error: error.message || "Unknown error",
          };
        }
      });

      const storeResults = await Promise.allSettled(storePromises);

      const failedStores = storeResults.filter(
        (result) =>
          result.status === "rejected" ||
          (result.status === "fulfilled" && !result.value.success)
      ).length;

      if (failedStores > 0) {
        console.warn(`[Home] ${failedStores} events failed to store locally`);
      }

      try {
        const storedEvents = await getStoredEvents();
        console.log(
          "[Home] Local events loaded:",
          storedEvents?.length || 0,
          "event(s)"
        );
        setEvents(storedEvents || []);

        if (failedStores > 0 && failedStores < response.events.length) {
          setModalTitle("Partial Sync Warning");
          setModalMessage(
            `Some events may not be fully synchronized. ${
              storedEvents?.length || 0
            } events are available locally.`
          );
          setModalVisible(true);
        }
      } catch (storageError) {
        console.error("[Home] Error loading stored events:", storageError);

        setEvents(response.events || []);

        setModalTitle("Storage Warning");
        setModalMessage(
          "Unable to save events locally. Showing current data from server."
        );
        setModalVisible(true);
      }
    } catch (error) {
      console.error(
        "[Home] Critical error in fetchEvent:",
        error.message || error
      );

      try {
        const netState = await NetInfo.fetch();
        if (netState.isConnected === false) {
          console.warn("[Home] Device is offline.");
          setModalTitle("No Internet Connection");
          setModalMessage("You're currently offline. Showing saved events.");
        } else {
          setModalTitle("Error");
          setModalMessage(
            "An unexpected error occurred while fetching events."
          );
        }
      } catch (netError) {
        console.error("[Home] Error checking network state:", netError);
        setModalTitle("Error");
        setModalMessage("An unexpected error occurred while fetching events.");
      }

      setModalVisible(true);

      try {
        const storedEvents = await getStoredEvents();
        console.log(
          "[Home] Showing cached events due to error:",
          storedEvents?.length || 0,
          "event(s)"
        );
        setEvents(storedEvents || []);
      } catch (cacheError) {
        console.error("[Home] Error loading cached events:", cacheError);
        setEvents([]);

        if (!modalVisible) {
          setModalTitle("Storage Error");
          setModalMessage(
            "Unable to load events from local storage. Please restart the app."
          );
          setModalVisible(true);
        }
      }
    } finally {
      clearTimeout(timeout);
      if (!timeoutTriggered) {
        console.log("[Home] Event fetch completed.");
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (blockId !== null) {
      console.log("[Home] Block ID changed. Fetching events...");
      fetchEvent();
    }
  }, [blockId]);

  const onRefresh = async () => {
    if (refreshing) {
      console.warn("[Home] Already refreshing. Ignoring duplicate refresh.");
      return;
    }

    console.log("[Home] User triggered pull-to-refresh.");

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
      if (timeParts.length < 2) {
        console.warn(`[formatTime] Invalid time format: ${timeString}`);
        return "N/A";
      }

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
        console.warn(`[formatTime] Invalid time values: ${timeString}`);
        return "N/A";
      }

      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes.toString().padStart(2, "0");

      return `${formattedHours}:${formattedMinutes} ${ampm}`;
    } catch (error) {
      console.warn(
        `[formatTime] Error formatting time "${timeString}":`,
        error.message
      );
      return "N/A";
    }
  };

  const formatEventDates = (dates) => {
    try {
      const datesString = Array.isArray(dates) ? dates.join(",") : dates;
      if (!datesString || typeof datesString !== "string") {
        console.warn("[Home] Invalid date input in formatEventDates.");
        return "N/A";
      }

      const datesArray = datesString.split(",");
      if (datesArray.length === 0) return "N/A";

      const parsedDates = datesArray
        .map((dateStr) => new Date(dateStr))
        .filter((d) => !isNaN(d));

      if (parsedDates.length === 0) {
        console.warn("[Home] No valid dates parsed.");
        return "N/A";
      }

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
      console.error("[Home] Error formatting event dates:", error.message);
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
      console.log("[Home] Screen focused. Checking role ID...");
      if (userDataLoaded && roleId !== null && roleId !== 1) {
        console.log("[Home] Role ID not 1. Triggering sync.");
        startSync()
          .then((syncResult) => {
            if (syncResult && syncResult.userData) {
              updateUserData(syncResult.userData);
            }
          })
          .catch((syncError) => {
            console.error("[Home] Sync failed:", syncError);
          });
      }
    }, [userDataLoaded, roleId])
  );

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
          {events.length > 0 ? (
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
              No upcoming or ongoing events found. Please check back later.
            </Text>
          )}
        </ScrollView>
      </View>
      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type="warning"
        onClose={() => setModalVisible(false)}
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
  },
  headerContainer: {
    marginTop: 20,
    paddingHorizontal: theme.spacing.medium,
  },
});
