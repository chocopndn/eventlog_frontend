import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { getRoleID } from "../../../../database/queries";
import {
  fetchAllPastEvents,
  fetchAllOngoingEvents,
} from "../../../../services/api/records";
import moment from "moment";
import CustomSearch from "../../../../components/CustomSearch";
import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import { router } from "expo-router";

const Records = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredOngoingEvents, setFilteredOngoingEvents] = useState([]);
  const [filteredPastEvents, setFilteredPastEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [originalOngoing, setOriginalOngoing] = useState([]);
  const [originalPast, setOriginalPast] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const ongoingApiResponse = await fetchAllOngoingEvents();
        const pastApiResponse = await fetchAllPastEvents();

        const ongoingEvents = ongoingApiResponse?.events || [];
        const pastEvents = pastApiResponse?.events || [];

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

        const allEvents = Object.values(groupedEvents);

        const ongoingList = Object.values(groupedEvents).filter((event) =>
          ongoingEvents.some((e) => e.event_id === event.event_id)
        );

        const pastList = Object.values(groupedEvents).filter((event) =>
          pastEvents.some((e) => e.event_id === event.event_id)
        );

        setAllEvents(allEvents);
        setOriginalOngoing(ongoingList);
        setOriginalPast(pastList);
        setFilteredOngoingEvents(ongoingList);
        setFilteredPastEvents(pastList);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    try {
      if (!searchTerm.trim()) {
        setFilteredOngoingEvents(originalOngoing);
        setFilteredPastEvents(originalPast);
      } else {
        const filteredEvents = allEvents.filter((event) =>
          event.event_name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredOngoingEvents(
          filteredEvents.filter((event) =>
            originalOngoing.some((e) => e.event_id === event.event_id)
          )
        );
        setFilteredPastEvents(
          filteredEvents.filter((event) =>
            originalPast.some((e) => e.event_id === event.event_id)
          )
        );
      }
    } catch (error) {
      console.error("Error filtering events:", error);
    }
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

  return (
    <View style={globalStyles.secondaryContainer}>
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
        <>
          {filteredOngoingEvents.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Ongoing Events</Text>
              {filteredOngoingEvents.map((event, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.eventContainer}
                  onPress={() =>
                    router.push(
                      `/eventManagement/records/BlockList?eventId=${event.event_id}`
                    )
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
                    router.push(
                      `/eventManagement/records/BlockList?eventId=${event.event_id}`
                    )
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
        </>
        {!hasEvents && (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>No events available.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
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
