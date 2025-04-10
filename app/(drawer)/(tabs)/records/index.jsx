import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { getRoleID, getStoredUser } from "../../../../database/queries";
import {
  saveRecords,
  getStoredRecords,
} from "../../../../database/queries/records";
import {
  fetchUserOngoingEvents,
  fetchUserPastEvents,
} from "../../../../services/api/records";
import moment from "moment";

import CustomSearch from "../../../../components/CustomSearch";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

import { router } from "expo-router";

const Records = () => {
  const [roleId, setRoleId] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [filteredOngoingEvents, setFilteredOngoingEvents] = useState([]);
  const [filteredPastEvents, setFilteredPastEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRoleId = async () => {
      const roleId = await getRoleID();
      setRoleId(roleId);
    };

    fetchRoleId();
  }, []);

  useEffect(() => {
    const fetchDataAndSaveToSQLite = async () => {
      try {
        const storedUser = await getStoredUser();
        if (!storedUser || !storedUser.id_number) {
          return;
        }
        const idNumber = storedUser.id_number;

        const ongoingApiResponse = await fetchUserOngoingEvents(idNumber);
        const pastApiResponse = await fetchUserPastEvents(idNumber);

        const allEvents = [
          ...(ongoingApiResponse?.events || []),
          ...(pastApiResponse?.events || []),
        ];

        const saveResult = await saveRecords(allEvents);
        if (!saveResult || !saveResult.success) {
          return;
        }

        const storedRecords = await getStoredRecords();
        if (!storedRecords || !storedRecords.success || !storedRecords.data) {
          return;
        }

        const currentDate = moment().format("YYYY-MM-DD");
        const groupedEvents = {};

        storedRecords.data.forEach((record) => {
          const { event_id, event_name, event_date } = record;

          if (!groupedEvents[event_id]) {
            groupedEvents[event_id] = {
              event_id,
              event_name,
              event_dates: [],
            };
          }

          groupedEvents[event_id].event_dates.push(event_date);
        });

        const ongoing = [];
        const past = [];

        Object.values(groupedEvents).forEach((event) => {
          const isOngoing = event.event_dates.some((date) =>
            moment(date).isSameOrAfter(currentDate)
          );

          if (isOngoing) {
            ongoing.push(event);
          } else {
            past.push(event);
          }
        });

        setAllEvents(ongoing.concat(past));
        setFilteredOngoingEvents(ongoing);
        setFilteredPastEvents(past);
      } catch (error) {}
    };

    fetchDataAndSaveToSQLite();
  }, []);

  useEffect(() => {
    const filteredEvents = allEvents.filter((event) =>
      event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentDate = moment().format("YYYY-MM-DD");
    const ongoing = filteredEvents.filter((event) =>
      event.event_dates.some((date) => moment(date).isSameOrAfter(currentDate))
    );
    const past = filteredEvents.filter(
      (event) =>
        !event.event_dates.some((date) =>
          moment(date).isSameOrAfter(currentDate)
        )
    );

    setFilteredOngoingEvents(ongoing);
    setFilteredPastEvents(past);
  }, [searchTerm]);

  if (roleId === 1 || roleId === 2) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <View style={styles.searchContainer}>
          <CustomSearch
            placeholder="Search records"
            onSearch={(text) => setSearchTerm(text)}
          />
        </View>
        <ScrollView
          style={{ flex: 1, width: "100%", marginBottom: 20 }}
          contentContainerStyle={styles.scrollview}
          showsVerticalScrollIndicator={false}
        >
          {filteredOngoingEvents.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Ongoing Events</Text>
              {filteredOngoingEvents.map((event, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.eventContainer}
                  onPress={() =>
                    router.push(`/records/Attendance?eventId=${event.event_id}`)
                  }
                >
                  <Text style={styles.eventTitle}>{event.event_name}</Text>
                  <Text style={styles.eventDate}>
                    {Array.isArray(event.event_dates) &&
                    event.event_dates.length > 0
                      ? event.event_dates.join(", ")
                      : "No dates available"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {filteredPastEvents.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Past Events</Text>
              {filteredPastEvents.map((event, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.eventContainer}
                  onPress={() =>
                    router.push(`/records/Attendance?eventId=${event.event_id}`)
                  }
                >
                  <Text style={styles.eventTitle}>{event.event_name}</Text>
                  <Text style={styles.eventDate}>
                    {Array.isArray(event.event_dates) &&
                    event.event_dates.length > 0
                      ? event.event_dates.join(", ")
                      : "No dates available"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {filteredOngoingEvents.length === 0 &&
            filteredPastEvents.length === 0 && (
              <View style={styles.noEventsContainer}>
                <Text style={styles.noEventsText}>No events available.</Text>
              </View>
            )}
        </ScrollView>
      </SafeAreaView>
    );
  } else if (roleId === 3) {
    return (
      <SafeAreaView>
        <Text>View for roleid 3</Text>
      </SafeAreaView>
    );
  }
};

export default Records;

const styles = StyleSheet.create({
  searchContainer: {
    width: "90%",
    marginTop: 30,
  },
  eventContainer: {
    borderWidth: 2,
    width: "90%",
    height: 50,
    borderColor: theme.colors.primary,
    marginTop: theme.spacing.medium,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.small,
  },
  scrollview: {
    alignItems: "center",
    flexGrow: 1,
  },
  eventTitle: {
    color: theme.colors.primary,
    fontFamily: "SquadaOne",
    fontSize: theme.fontSizes.large,
  },
  eventDate: {
    fontSize: theme.fontSizes.small,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
  },
  sectionContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.title,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
  },
  noEventsContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.large,
  },
  noEventsText: {
    fontSize: theme.fontSizes.medium,
    fontFamily: "SquadaOne",
    color: theme.colors.secondary,
    textAlign: "center",
    marginTop: theme.spacing.medium,
  },
});
