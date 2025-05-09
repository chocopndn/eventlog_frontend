import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";


import { fetchBlocksOfEvents } from "../../../../services/api/records";
import { fetchDepartments, fetchYearLevels } from "../../../../services/api";


import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";


import CustomButton from "../../../../components/CustomButton";
import CustomDropdown from "../../../../components/CustomDropdown";

const BlockList = () => {
  const { eventId } = useLocalSearchParams();
  const [eventTitle, setEventTitle] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYearLevel, setSelectedYearLevel] = useState("");

  
  const [allDepartments, setAllDepartments] = useState([]);
  const [allYearLevels, setAllYearLevels] = useState([]);

  
  useEffect(() => {
    console.log("🔄 Starting: Loading all departments/year levels");

    const loadFilterOptions = async () => {
      try {
        const deptData = await fetchDepartments();
        const yearData = await fetchYearLevels();

        console.log("✅ Fetched All Departments:", deptData.departments);
        console.log("✅ Fetched All Year Levels:", yearData);

        setAllDepartments(deptData.departments || []);
        setAllYearLevels(yearData || []);

        console.log("📦 Stored all departments/year levels");
      } catch (error) {
        console.error("❌ Failed to load filter options:", error.message);
      }
    };

    loadFilterOptions();
  }, []);

  
  useEffect(() => {
    if (!eventId) return;

    console.log(`🔄 Starting: Loading data for event ID ${eventId}`);

    const loadEventData = async () => {
      try {
        setLoading(true);

        const event_id = Number(eventId);

        console.log("📡 Sending initial request for event:", event_id);

        const blocksData = await fetchBlocksOfEvents(event_id, "", "");
        console.log("✅ Fetched Blocks Data:\n", JSON.stringify(blocksData, null, 2));

        if (!blocksData?.success) {
          throw new Error("Backend returned success: false");
        }

        setEventTitle(blocksData?.data?.event_title || "Event Title Not Found");
        setBlocks(blocksData?.data?.block_details || []);

        
        const deptIDs = blocksData?.data?.department_ids || [];
        console.log("📌 Department IDs from event:", deptIDs);

        const deptOptions = allDepartments
          .filter((dept) => deptIDs.includes(dept.department_id))
          .map((dept) => ({
            label: dept.department_code,
            value: String(dept.department_id),
          }));

        console.log("🧾 Filtered Departments:", deptOptions);
        setDepartments([{ label: "All Departments", value: "" }, ...deptOptions]);

        
        const yearIDs = blocksData?.data?.yearlevel_ids || [];
        console.log("📌 Year Level IDs from event:", yearIDs);

        const yearOptions = allYearLevels
          .filter((year) => yearIDs.includes(year.year_level_id))
          .map((year) => ({
            label: year.year_level_name,
            value: String(year.year_level_id),
          }));

        console.log("🧾 Filtered Year Levels:", yearOptions);
        setYearLevels([{ label: "All Year Levels", value: "" }, ...yearOptions]);
      } catch (error) {
        console.error("❌ Failed to load event data:", error.message);
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId]);

  
  useEffect(() => {
    if (!eventId) return;

    console.log("🔄 Triggered refetch due to filter change");
    console.log("🔍 Current Filters:", {
      department_id: selectedDepartment,
      year_level_id: selectedYearLevel,
    });

    const fetchData = async () => {
      try {
        setLoading(true);

        const event_id = Number(eventId);

        const blocksData = await fetchBlocksOfEvents(
          event_id,
          selectedDepartment || undefined,
          selectedYearLevel || undefined
        );

        console.log("✅ Fetched filtered blocks:\n", JSON.stringify(blocksData, null, 2));
        setBlocks(blocksData?.data?.block_details || []);
      } catch (error) {
        console.error("❌ Failed to fetch filtered blocks:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDepartment, selectedYearLevel, eventId]);

  return (
    <View style={globalStyles.secondaryContainer}>
      {/* Event Title */}
      <Text style={styles.eventTitle}>{eventTitle}</Text>

      {/* Filter Dropdowns */}
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <View style={{ width: "48%" }}>
            <CustomDropdown
              placeholder="Department"
              data={departments}
              labelField="label"
              valueField="value"
              value={selectedDepartment}
              onSelect={(item) => {
                console.log("🔽 Selected Department changed to", item.value);
                setSelectedDepartment(item.value);
              }}
            />
          </View>
          <View style={{ width: "48%" }}>
            <CustomDropdown
              placeholder="Year Level"
              data={yearLevels}
              labelField="label"
              valueField="value"
              value={selectedYearLevel}
              onSelect={(item) => {
                console.log("🔽 Selected Year Level changed to", item.value);
                setSelectedYearLevel(item.value);
              }}
            />
          </View>
        </View>
      </View>

      {/* Scrollable Block List */}
      <ScrollView contentContainerStyle={styles.scrollviewContainer}>
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

      {/* Print Button */}
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