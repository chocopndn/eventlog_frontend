import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getStoredUser();
        if (!user) return;
        setBlockId(user?.block_id || null);
        setRoleId(user?.role_id || null);
      } catch (error) {
        console.error("Error fetching user data:", error.message);
      }
    };
    fetchUserData();
  }, []);

  const fetchEvent = async () => {
    setRefreshing(true);
    let timeoutTriggered = false;
    const timeout = setTimeout(() => {
      timeoutTriggered = true;
      setModalTitle("Connection Issue");
      setModalMessage(
        "Fetching events is taking too long. Please check your internet connection."
      );
      setModalVisible(true);
    }, 7000);

    try {
      const response = await fetchUpcomingEvents(blockId);

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to fetch events from API."
        );
      }

      if (response.events.length === 0) {
        await clearEventsTable();
        setEvents([]);
        return;
      }

      const allApiEventIds = response.events.map((e) => e.event_id);
      await Promise.all(
        response.events.map(async (event) => {
          try {
            await storeEvent(event, allApiEventIds);
          } catch (error) {
            console.error(
              "Error storing event:",
              event.event_id,
              error.message
            );
          }
        })
      );

      const storedEvents = await getStoredEvents();
      setEvents(storedEvents || []);
    } catch (error) {
      console.error("Error fetching events:", error.message);
      const netState = await NetInfo.fetch();
      if (netState.isConnected === false) {
        setModalTitle("No Internet Connection");
        setModalMessage("You're currently offline. Showing saved events.");
      } else {
        setModalTitle("Error");
        setModalMessage("An unexpected error occurred while fetching events.");
      }
      setModalVisible(true);

      const storedEvents = await getStoredEvents();
      setEvents(storedEvents || []);
    } finally {
      clearTimeout(timeout);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [blockId]);

  const onRefresh = async () => {
    await fetchEvent();
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const [hours, minutes] = timeString.split(":").map(Number);
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const formatEventDates = (dates) => {
    const datesString = Array.isArray(dates) ? dates.join(",") : dates;
    if (!datesString || typeof datesString !== "string") return "N/A";
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
    return Object.values(grouped)
      .map((group) => {
        const days = group.sort((a, b) => a - b).join(", ");
        return `${group.month} ${days}, ${group.year}`;
      })
      .join(" & ");
  };

  useFocusEffect(() => {
    if (roleId !== 1) {
      startSync();
    }
  });

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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {events.length > 0 ? (
            events.map((event, index) => (
              <CollapsibleDropdown
                key={index}
                title={event.event_name}
                date={formatEventDates(event.event_dates)}
                venue={event.venue}
                am_in={formatTime(event.am_in)}
                am_out={formatTime(event.am_out)}
                pm_in={formatTime(event.pm_in)}
                pm_out={formatTime(event.pm_out)}
                personnel={event.scan_personnel}
              />
            ))
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
    marginBottom: 10,
    paddingHorizontal: theme.spacing.medium,
  },
});
