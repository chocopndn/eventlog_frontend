import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";

// API Services
import { fetchBlocksOfEvents } from "../../../../services/api/records";
import { fetchDepartments, fetchYearLevels } from "../../../../services/api";

// Constants & Styles
import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

// Components
import CustomButton from "../../../../components/CustomButton";
import CustomDropdown from "../../../../components/CustomDropdown";
import CustomSearch from "../../../../components/CustomSearch"; // Make sure this exists

const BlockList = () => {
  const { eventId } = useLocalSearchParams();
  const [eventTitle, setEventTitle] = useState("");
  const [allBlocks, setAllBlocks] = useState([]); // ✅ Original list for filtering
  const [blocks, setBlocks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYearLevel, setSelectedYearLevel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Store all departments/year levels (fetched once)
  const [allDepartments, setAllDepartments] = useState([]);
  const [allYearLevels, setAllYearLevels] = useState([]);

  // Load all departments/year levels ONCE
  useEffect(() => {
    console.log("🔄 Starting: Loading all departments/year levels");

    const loadFilterOptions = async () => {
      try {
        const deptData = await fetchDepartments();
        const yearData = await fetchYearLevels();

        setAllDepartments(deptData.departments || []);
        setAllYearLevels(yearData || []);

        console.log("📦 Stored all departments/year levels");
      } catch (error) {
        console.error("❌ Failed to load dropdown options:", error.message);
      }
    };

    loadFilterOptions();
  }, []);

  // Load event data + filter dropdowns based on event
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

        // ✅ Map blocks with course_code + block_name
        const mappedBlocks = blocksData?.data?.block_details.map((block) => ({
          ...block,
          display_name: block.course_code
            ? `${block.course_code} ${block.block_name}`
            : block.block_name,
        }));

        setAllBlocks(mappedBlocks); // Save original list for filtering
        setBlocks(mappedBlocks);    // Set current list to show all

        // Filter departments/year levels based on event
        const deptIDs = blocksData?.data?.department_ids || [];
        const deptOptions = allDepartments
          .filter((dept) => deptIDs.includes(dept.department_id))
          .map((dept) => ({
            label: dept.department_code,
            value: String(dept.department_id),
          }));
        setDepartments([{ label: "All Departments", value: "" }, ...deptOptions]);

        const yearIDs = blocksData?.data?.yearlevel_ids || [];
        const yearOptions = allYearLevels
          .filter((year) => yearIDs.includes(year.year_level_id))
          .map((year) => ({
            label: year.year_level_name,
            value: String(year.year_level_id),
          }));
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

  // Refetch blocks when filters change
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

        // ✅ Map again with display name
        const mappedBlocks = blocksData?.data?.block_details.map((block) => ({
          ...block,
          display_name: block.course_code
            ? `${block.course_code} ${block.block_name}`
            : block.block_name,
        }));

        setAllBlocks(mappedBlocks);
        setBlocks(mappedBlocks);
      } catch (error) {
        console.error("❌ Failed to fetch filtered blocks:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDepartment, selectedYearLevel, eventId]);

  // Handle Search Input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setBlocks(allBlocks); // Reset to full list
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();

    const filtered = allBlocks.filter((block) =>
      block.display_name.toLowerCase().includes(lowerQuery)
    );

    setBlocks(filtered);
  }, [searchQuery]);

  return (
    <View style={globalStyles.secondaryContainer}>
      {/* Event Title */}
      <Text style={styles.eventTitle}>{eventTitle}</Text>

      {/* Search Input */}
      <View style={styles.container}>
        <CustomSearch
          placeholder="Search blocks..."
          value={searchQuery}
          onChangeText={(text) => {
            console.log("🔍 Search changed to:", text);
            setSearchQuery(text);
          }}
        />
      </View>

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
        ) : blocks.length === 0 && searchQuery !== "" ? (
          <Text style={styles.noDataText}>No matching blocks found.</Text>
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

// Individual Block Item Component
const BlockItem = ({ block }) => {
  return (
    <TouchableOpacity style={styles.blockContainer}>
      <Text style={styles.blockText}>
        {block.display_name || "Unnamed Block"}
      </Text>
    </TouchableOpacity>
  );
};

// Styles
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