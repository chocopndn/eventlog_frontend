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
import { saveRecords } from "../../../../database/queries/records";

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
        const roleId = await getRoleID();
        if (!roleId) return;
        setRoleId(roleId);
      } catch (error) {}
    };
    fetchRoleId();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let ongoingEvents = [];
        let pastEvents = [];
        if (roleId === 1 || roleId === 2) {
          const storedUser = await getStoredUser();
          if (!storedUser || !storedUser.id_number) return;
          const idNumber = storedUser.id_number;
          const ongoingApiResponse = await fetchUserOngoingEvents(idNumber);
          const pastApiResponse = await fetchUserPastEvents(idNumber);
          ongoingEvents = ongoingApiResponse?.events || [];
          pastEvents = pastApiResponse?.events || [];
        } else if (roleId === 3) {
          const ongoingApiResponse = await fetchAllOngoingEvents();
          const pastApiResponse = await fetchAllPastEvents();
          ongoingEvents = ongoingApiResponse?.events || [];
          pastEvents = pastApiResponse?.events || [];
        }
        const flattenedRecords = [...ongoingEvents, ...pastEvents].flatMap(
          (record) => {
            const { event_id, event_name, attendance } = record;
            if (
              !event_id ||
              !event_name ||
              !attendance ||
              !Array.isArray(attendance)
            ) {
              return [];
            }
            const attendanceMap = attendance[0];
            if (!attendanceMap || typeof attendanceMap !== "object") {
              return [];
            }
            return Object.entries(attendanceMap).map(([event_date, times]) => ({
              event_id,
              event_name,
              attendance: [{ [event_date]: times }],
            }));
          }
        );
        try {
          await saveRecords(flattenedRecords);
        } catch (error) {}
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
        const allEvents = [
          ...Object.values(groupedEvents).filter((event) =>
            ongoingEvents.some((e) => e.event_id === event.event_id)
          ),
          ...Object.values(groupedEvents).filter((event) =>
            pastEvents.some((e) => e.event_id === event.event_id)
          ),
        ];
        setAllEvents(allEvents);
        setFilteredOngoingEvents(
          Object.values(groupedEvents).filter((event) =>
            ongoingEvents.some((e) => e.event_id === event.event_id)
          )
        );
        setFilteredPastEvents(
          Object.values(groupedEvents).filter((event) =>
            pastEvents.some((e) => e.event_id === event.event_id)
          )
        );
      } catch (error) {
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
      const filteredEvents = allEvents.filter((event) =>
        event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const ongoing = filteredEvents.filter((event) =>
        filteredOngoingEvents.some((e) => e.event_id === event.event_id)
      );
      const past = filteredEvents.filter((event) =>
        filteredPastEvents.some((e) => e.event_id === event.event_id)
      );
      setFilteredOngoingEvents(ongoing);
      setFilteredPastEvents(past);
    } catch (error) {}
  }, [searchTerm]);

  if (loading) {
    return (
      <View style={globalStyles.secondaryContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const hasEvents =
    filteredOngoingEvents.length > 0 || filteredPastEvents.length > 0;

  if (roleId === 1 || roleId === 2) {
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
                      ? event.event_dates
                          .map((date) => moment(date).format("MMM DD, YYYY"))
                          .join(", ")
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
                      ? event.event_dates
                          .map((date) => moment(date).format("MMM DD, YYYY"))
                          .join(", ")
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
                      ? event.event_dates
                          .map((date) => moment(date).format("MMM DD, YYYY"))
                          .join(", ")
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
                      ? event.event_dates
                          .map((date) => moment(date).format("MMM DD, YYYY"))
                          .join(", ")
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
    color: theme.colors.primary,
  },
  loadingText: {
    fontSize: theme.fontSizes.large,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
  },
});
