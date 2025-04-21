import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { getRoleID, getStoredUser } from "../../../../database/queries";
import {
  fetchUserOngoingEvents,
  fetchUserPastEvents,
  fetchAllPastEvents,
  fetchAllOngoingEvents,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoleId = async () => {
      try {
        console.log("Fetching role ID...");
        const roleId = await getRoleID();
        if (!roleId) {
          console.error("Role ID is null or undefined.");
        } else {
          console.log(`Role ID fetched successfully: ${roleId}`);
        }
        setRoleId(roleId);
      } catch (error) {
        console.error("Error fetching role ID:", error.message || error);
      }
    };
    fetchRoleId();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for role ID:", roleId);
        setLoading(true);

        let ongoingEvents = [];
        let pastEvents = [];

        if (roleId === 1 || roleId === 2) {
          console.log("Fetching user-specific events...");
          const storedUser = await getStoredUser();
          if (!storedUser || !storedUser.id_number) {
            console.error("Invalid or missing user ID in stored user data.");
            return;
          }
          const idNumber = storedUser.id_number;
          console.log(
            `Fetching ongoing and past events for user ID: ${idNumber}`
          );

          const ongoingApiResponse = await fetchUserOngoingEvents(idNumber);
          console.log(
            "API Response for fetchUserOngoingEvents:",
            JSON.stringify(ongoingApiResponse, null, 2) // Log the full response in detail
          );

          const pastApiResponse = await fetchUserPastEvents(idNumber);
          console.log(
            "API Response for fetchUserPastEvents:",
            JSON.stringify(pastApiResponse, null, 2) // Log the full response in detail
          );

          ongoingEvents = ongoingApiResponse?.events || [];
          pastEvents = pastApiResponse?.events || [];

          // Log the attendance array in detail
          if (ongoingEvents.length > 0) {
            ongoingEvents.forEach((event, index) => {
              console.log(`Event ${index + 1}:`, event);
              if (event.attendance && Array.isArray(event.attendance)) {
                console.log(
                  `Attendance for Event ${index + 1}:`,
                  event.attendance
                );
              } else {
                console.log(`No attendance data for Event ${index + 1}.`);
              }
            });
          }
        } else if (roleId === 3) {
          console.log("Fetching all events...");

          const ongoingApiResponse = await fetchAllOngoingEvents();
          console.log(
            "API Response for fetchAllOngoingEvents:",
            JSON.stringify(ongoingApiResponse, null, 2)
          );

          const pastApiResponse = await fetchAllPastEvents();
          console.log(
            "API Response for fetchAllPastEvents:",
            JSON.stringify(pastApiResponse, null, 2)
          );

          ongoingEvents = ongoingApiResponse?.events || [];
          pastEvents = pastApiResponse?.events || [];
        }

        console.log("Processing events...");
        const currentDate = moment().format("YYYY-MM-DD");
        const groupedEvents = {};

        [...ongoingEvents, ...pastEvents].forEach((record) => {
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

        console.log(
          `Processed ${ongoing.length} ongoing events and ${past.length} past events.`
        );

        setAllEvents(ongoing.concat(past));
        setFilteredOngoingEvents(ongoing);
        setFilteredPastEvents(past);
      } catch (error) {
        console.error("Error in fetchData:", error.message || error);
      } finally {
        setLoading(false);
      }
    };

    if (roleId !== null) {
      fetchData();
    }
  }, [roleId]);

  useEffect(() => {
    try {
      console.log("Filtering events based on search term...");
      const filteredEvents = allEvents.filter((event) =>
        event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const currentDate = moment().format("YYYY-MM-DD");
      const ongoing = filteredEvents.filter((event) =>
        event.event_dates.some((date) =>
          moment(date).isSameOrAfter(currentDate)
        )
      );
      const past = filteredEvents.filter(
        (event) =>
          !event.event_dates.some((date) =>
            moment(date).isSameOrAfter(currentDate)
          )
      );
      console.log(
        `Filtered ${ongoing.length} ongoing events and ${past.length} past events.`
      );
      setFilteredOngoingEvents(ongoing);
      setFilteredPastEvents(past);
    } catch (error) {
      console.error("Error filtering events:", error.message || error);
    }
  }, [searchTerm]);

  if (loading) {
    console.log("Loading state is true. Displaying loading indicator...");
    return (
      <View style={globalStyles.secondaryContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const hasEvents =
    filteredOngoingEvents.length > 0 || filteredPastEvents.length > 0;

  if (roleId === 1 || roleId === 2) {
    console.log("Rendering records for role ID 1 or 2...");
    return (
      <View style={globalStyles.secondaryContainer}>
        {hasEvents && (
          <View style={styles.searchContainer}>
            <CustomSearch
              placeholder="Search records"
              onSearch={(text) => setSearchTerm(text)}
            />
          </View>
        )}
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
          {!hasEvents && (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsText}>No events available.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  } else if (roleId === 3) {
    console.log("Rendering records for role ID 3...");
    return (
      <View style={globalStyles.secondaryContainer}>
        {hasEvents && (
          <View style={styles.searchContainer}>
            <CustomSearch
              placeholder="Search records"
              onSearch={(text) => setSearchTerm(text)}
            />
          </View>
        )}
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
                    router.push(`/records/BlockList?eventId=${event.event_id}`)
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
                    router.push(`/records/BlockList?eventId=${event.event_id}`)
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
          {!hasEvents && (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsText}>No events available.</Text>
            </View>
          )}
        </ScrollView>
      </View>
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
  loadingText: {
    fontSize: theme.fontSizes.large,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
    textAlign: "center",
    marginTop: theme.spacing.large,
  },
});
