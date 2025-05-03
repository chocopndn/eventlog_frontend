import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { fetchBlocksOfEvents } from "../../../../services/api/records";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

import CustomSearch from "../../../../components/CustomSearch";
import CustomDropdown from "../../../../components/CustomDropdown";

const BlockList = () => {
  const { eventId } = useLocalSearchParams();
  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBlocksOfEvents(eventId);
        console.log("Fetched Blocks:\n", JSON.stringify(data, null, 2));

        setEventTitle(data?.data?.event_title || "Event Title Not Found");
      } catch (error) {
        console.error("Failed to fetch blocks:", error);
      }
    };

    fetchData();
  }, [eventId]);

  return (
    <View style={globalStyles.secondaryContainer}>
      <View style={styles.container}>
        <CustomSearch />
        <View style={styles.filterContainer}>
          <View style={{ width: "48%" }}>
            <CustomDropdown placeholder="Department" />
          </View>
          <View style={{ width: "48%" }}>
            <CustomDropdown placeholder="Year Level" />
          </View>
        </View>
        {/* Display the event title dynamically */}
        <Text style={styles.eventTitle}>{eventTitle}</Text>
      </View>
    </View>
  );
};

export default BlockList;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: theme.spacing.medium,
    alignItems: "center",
  },
  eventTitle: {
    fontSize: theme.fontSizes.huge,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    marginVertical: theme.spacing.medium,
  },
  filterContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.medium,
  },
});
