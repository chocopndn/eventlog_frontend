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
import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import CustomButton from "../../../../components/CustomButton";
import CustomDropdown from "../../../../components/CustomDropdown";
import CustomSearch from "../../../../components/CustomSearch";
import { router } from "expo-router";

const BlockList = () => {
  const { eventId, blockId } = useLocalSearchParams();
  const [eventTitle, setEventTitle] = useState("");
  const [allBlocks, setAllBlocks] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYearLevel, setSelectedYearLevel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!eventId) {
      return;
    }

    const loadEventData = async () => {
      try {
        setLoading(true);
        const event_id = Number(eventId);
        const blocksData = await fetchBlocksOfEvents(event_id, "", "");

        if (!blocksData?.success) {
          throw new Error("Backend returned success: false");
        }

        setEventTitle(blocksData?.data?.event_title || "Event Title Not Found");

        const mappedBlocks =
          blocksData?.data?.blocks?.map((block) => ({
            ...block,
            display_name: block.course_code
              ? `${block.course_code} ${block.block_name}`
              : block.block_name,
          })) || [];

        setAllBlocks(mappedBlocks);
        setBlocks(mappedBlocks);

        const uniqueDepartments = [
          ...new Set(mappedBlocks.map((block) => block.department_id)),
        ];
        const deptOptions = uniqueDepartments.map((deptId) => ({
          label: mappedBlocks.find((block) => block.department_id === deptId)
            ?.course_code,
          value: String(deptId),
        }));

        setDepartments([
          { label: "All Departments", value: "" },
          ...deptOptions,
        ]);

        const uniqueYearLevels = [
          ...new Set(mappedBlocks.map((block) => block.year_level_id)),
        ];
        const yearOptions = uniqueYearLevels.map((yearId) => ({
          label: `Year ${yearId}`,
          value: String(yearId),
        }));

        setYearLevels([
          { label: "All Year Levels", value: "" },
          ...yearOptions,
        ]);
      } catch (error) {
        setAllBlocks([]);
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId]);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    if (!selectedDepartment && !selectedYearLevel) {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const event_id = Number(eventId);
        const blocksData = await fetchBlocksOfEvents(
          event_id,
          selectedDepartment || undefined,
          selectedYearLevel || undefined
        );

        let mappedBlocks = [];
        if (blocksData?.data?.blocks?.length > 0) {
          mappedBlocks = blocksData.data.blocks.map((block) => ({
            ...block,
            display_name: block.course_code
              ? `${block.course_code} ${block.block_name}`
              : block.block_name,
          }));
        }

        setAllBlocks(mappedBlocks);
        setBlocks(mappedBlocks);
      } catch (error) {
        setAllBlocks([]);
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDepartment, selectedYearLevel, eventId]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setBlocks(allBlocks);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = allBlocks.filter((block) => {
      const displayName = block.display_name || "";
      return displayName.toLowerCase().includes(lowerQuery);
    });

    setBlocks(filtered);
  }, [searchQuery, allBlocks]);

  return (
    <View style={globalStyles.secondaryContainer}>
      <Text style={styles.eventTitle}>{eventTitle}</Text>

      <View style={styles.container}>
        <CustomSearch
          placeholder="Search blocks..."
          onSearch={(text) => {
            setSearchQuery(text);
          }}
        />
      </View>

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
                setSelectedYearLevel(item.value);
              }}
            />
          </View>
        </View>
      </View>

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
              <View
                key={index}
                style={
                  blocks.length === 1
                    ? styles.singleBlockContainer
                    : styles.multiBlockContainer
                }
              >
                <TouchableOpacity
                  style={styles.blockContainer}
                  onPress={() => {
                    router.push({
                      pathname: "/records/StudentsList",
                      params: {
                        eventId: eventId,
                        blockId: block.block_id,
                      },
                    });
                  }}
                >
                  <Text style={styles.blockText}>
                    {block.display_name || "Unnamed Block"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <CustomButton title="Print" onPress={() => {}} />
      </View>
    </View>
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
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  singleBlockContainer: {
    width: "100%",
    marginVertical: theme.spacing.small,
  },
  multiBlockContainer: {
    width: "48%",
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
