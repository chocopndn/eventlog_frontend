import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
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
} from "../../../../database/queries";
import {
  fetchApprovedOngoing,
  fetchUserUpcomingEvents,
} from "../../../../services/api";

const screenWidth = Dimensions.get("window").width;

const Home = () => {
  const [roleId, setRoleId] = useState(null);
  const [events, setEvents] = useState([]);
  const [blockId, setblockId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getStoredUser();
      setRoleId(user.role_id);
      setblockId(user.block_id);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      if (roleId === null) return;

      try {
        let response;
        if (roleId === 3 || roleId === 4) {
          response = await fetchApprovedOngoing();
        } else if (blockId !== null) {
          response = await fetchUserUpcomingEvents(blockId);
        } else {
          return;
        }

        if (response?.success) {
          await Promise.all(response.events.map((event) => storeEvent(event)));

          const storedEvents = await getStoredEvents();
          setEvents(storedEvents || []);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvent();
  }, [roleId, blockId]);

  const formatTime = (timeString) => {
    const date = new Date(`1970-01-01T${timeString}Z`);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  const formatEventDates = (datesArray) => {
    if (!Array.isArray(datesArray) || datesArray.length === 0) return "N/A";

    if (datesArray.length === 1) {
      return new Date(datesArray[0]).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    let groups = {};

    datesArray.forEach((date) => {
      let d = new Date(date);
      if (isNaN(d.getTime())) {
        return;
      }
      let month = d.toLocaleString("en-US", { month: "long" });
      let day = d.getDate();
      let year = d.getFullYear();
      let key = `${month} ${year}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(day);
    });

    return Object.entries(groups)
      .map(
        ([monthYear, days]) =>
          `${monthYear.split(" ")[0]} ${days.join(", ")} ${
            monthYear.split(" ")[1]
          }`
      )
      .join(" & ");
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
          style={styles.welcomeContainer}
        >
          <Text style={styles.welcomeText}>WELCOME EVENTLOG USERS!</Text>
        </TouchableOpacity>
        <ScrollView
          style={{ marginBottom: 20 }}
          contentContainerStyle={styles.scrollview}
          showsVerticalScrollIndicator={false}
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
            <Text>No approved ongoing events found</Text>
          )}
        </ScrollView>
      </View>

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
});
