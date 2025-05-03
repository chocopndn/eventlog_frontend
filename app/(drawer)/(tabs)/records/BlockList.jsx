import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { fetchBlocksOfEvents } from "../../../../services/api/records";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

import CustomSearch from "../../../../components/CustomSearch";
import CustomDropdown from "../../../../components/CustomDropdown";
import CustomButton from "../../../../components/CustomButton";

const BlockList = () => {
  const { eventId } = useLocalSearchParams();
  const [eventTitle, setEventTitle] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchBlocksOfEvents(eventId);
        console.log("Fetched Blocks:\n", JSON.stringify(data, null, 2));

        setEventTitle(data?.data?.event_title || "Event Title Not Found");
        setBlocks(data?.data?.block_details || []);
      } catch (error) {
        console.error("Failed to fetch blocks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  return (
    <View style={globalStyles.secondaryContainer}>
      <Text style={styles.eventTitle}>{eventTitle}</Text>
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
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollviewContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.noDataText}>Loading blocks...</Text>
        ) : blocks.length === 0 ? (
          <Text style={styles.noDataText}>No blocks found.</Text>
        ) : (
          <View style={styles.gridContainer}>
            {blocks.map((block, index) => (
              <BlockItem key={index} block={block} />
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <CustomButton title="Print" />
      </View>
    </View>
  );
};

export default BlockList;

const BlockItem = ({ block }) => {
  return (
    <TouchableOpacity style={styles.blockContainer}>
      <Text style={styles.blockText}>
        {block.block_name || "Unnamed Block"}
      </Text>
    </TouchableOpacity>
  );
};

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
  scrollviewContainer: {
    paddingHorizontal: theme.spacing.medium,
    flexGrow: 1,
  },
  blockText: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.large,
    textAlign: "center",
  },
  blockContainer: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    width: "48%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: theme.spacing.small,
  },
  noDataText: {
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.large,
    color: theme.colors.secondary,
    textAlign: "center",
    marginTop: theme.spacing.large,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  buttonContainer: {
    width: "100%",
    marginVertical: 20,
    paddingHorizontal: theme.spacing.medium,
  },
});
