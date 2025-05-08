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
import { fetchDepartments, fetchYearLevels } from "../../../../services/api";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

import CustomSearch from "../../../../components/CustomSearch";
import CustomDropdown from "../../../../components/CustomDropdown";
import CustomButton from "../../../../components/CustomButton";

const BlockList = () => {
  const { eventId } = useLocalSearchParams();
  const [eventTitle, setEventTitle] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const blocksData = await fetchBlocksOfEvents(eventId);
        console.log("Fetched Blocks:\n", JSON.stringify(blocksData, null, 2));
        setEventTitle(blocksData?.data?.event_title || "Event Title Not Found");
        setBlocks(blocksData?.data?.block_details || []);

        const deptData = await fetchDepartments();
        console.log("Fetched Departments:\n", deptData);

        const filteredDepartments =
          deptData?.departments
            ?.filter((dept) =>
              blocksData?.data?.department_ids?.includes(dept.department_id)
            )
            .map((dept) => ({
              label: dept.department_code,
              value: dept.department_id,
            })) || [];

        setDepartments(filteredDepartments);

        const yearData = await fetchYearLevels();
        console.log("Fetched Year Levels:\n", yearData);

        const filteredYearLevels =
          yearData
            ?.filter((year) =>
              blocksData?.data?.yearlevel_ids?.includes(year.year_level_id)
            )
            .map((year) => ({
              label: year.year_level_name,
              value: year.year_level_id,
            })) || [];

        setYearLevels(filteredYearLevels);
      } catch (error) {
        console.error("Failed to fetch data:", error);
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
            <CustomDropdown
              placeholder="Department"
              data={departments}
              labelField="label"
              valueField="value"
            />
          </View>
          <View style={{ width: "48%" }}>
            <CustomDropdown
              placeholder="Year Level"
              data={yearLevels}
              labelField="label"
              valueField="value"
            />
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

export default BlockList;
