import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { fetchBlocksOfEvents } from "../../../../services/api/records";
import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import CustomButton from "../../../../components/CustomButton";
import CustomDropdown from "../../../../components/CustomDropdown";
import CustomSearch from "../../../../components/CustomSearch";
import PrintFilterModal from "../../../../components/PrintFilterModal";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import {
  fetchBlocks,
  fetchDepartments,
  fetchYearLevels,
} from "../../../../services/api";

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
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    if (!eventId) {
      return;
    }

    const loadEventData = async () => {
      try {
        setLoading(true);
        const event_id = Number(eventId);

        console.log("Fetching blocks for eventId:", event_id);

        const blocksData = await fetchBlocksOfEvents(event_id, "", "");

        console.log("Blocks API response:", blocksData);

        if (!blocksData?.success) {
          console.error("Backend returned success: false");
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

        console.log("Mapped blocks:", mappedBlocks);

        setAllBlocks(mappedBlocks);
        setBlocks(mappedBlocks);

        const uniqueDepartments = [
          ...new Set(mappedBlocks.map((block) => block.department_id)),
        ];

        console.log("Unique departments:", uniqueDepartments);

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

        console.log("Unique year levels:", uniqueYearLevels);

        const yearOptions = uniqueYearLevels.map((yearId) => ({
          label: `Year ${yearId}`,
          value: String(yearId),
        }));

        setYearLevels([
          { label: "All Year Levels", value: "" },
          ...yearOptions,
        ]);

        console.log("Component state updated");
      } catch (error) {
        console.error("Error loading event data:", error);
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

        console.log("Fetching filtered blocks for", {
          eventId: event_id,
          department: selectedDepartment,
          yearLevel: selectedYearLevel,
        });

        const blocksData = await fetchBlocksOfEvents(
          event_id,
          selectedDepartment || undefined,
          selectedYearLevel || undefined
        );

        console.log("Filtered blocks API response:", blocksData);

        let mappedBlocks = [];
        if (blocksData?.data?.blocks?.length > 0) {
          mappedBlocks = blocksData.data.blocks.map((block) => ({
            ...block,
            display_name: block.course_code
              ? `${block.course_code} ${block.block_name}`
              : block.block_name,
          }));
        }

        console.log("Mapped filtered blocks:", mappedBlocks);

        setAllBlocks(mappedBlocks);
        setBlocks(mappedBlocks);

        console.log("Filtered blocks state updated");
      } catch (error) {
        console.error("Error fetching filtered blocks:", error);
        setAllBlocks([]);
        setBlocks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDepartment, selectedYearLevel, eventId]);

  useEffect(() => {
    console.log("Search query changed:", searchQuery);

    if (!searchQuery.trim()) {
      setBlocks(allBlocks);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = allBlocks.filter((block) => {
      const displayName = block.display_name || "";
      return displayName.toLowerCase().includes(lowerQuery);
    });

    console.log("Search filtered blocks:", filtered);

    setBlocks(filtered);
  }, [searchQuery, allBlocks]);

  const handleSavePDF = async (filters) => {
    console.log("Generating PDF with filters:", filters);

    const filteredBlocks = blocks.filter((block) => {
      const departmentMatch = filters?.departmentId
        ? block.department_id === parseInt(filters.departmentId)
        : true;
      const yearLevelMatch = filters?.yearLevelId
        ? block.year_level_id === parseInt(filters.yearLevelId)
        : true;

      const blockMatch =
        filters?.blockIds?.length > 0
          ? filters.blockIds.includes(block.block_id.toString())
          : true;

      return departmentMatch && yearLevelMatch && blockMatch;
    });

    console.log("Filtered blocks for PDF:", filteredBlocks);

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #999; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>${eventTitle} - Block List</h1>
          <p><strong>Department:</strong> ${
            departments.find((dept) => dept.value === filters?.departmentId)
              ?.label || "All"
          }</p>
          <p><strong>Year Level:</strong> ${
            yearLevels.find((year) => year.value === filters?.yearLevelId)
              ?.label || "All"
          }</p>
          <p><strong>Block:</strong> ${
            filteredBlocks.find(
              (block) => block.block_id === parseInt(filters?.blockId)
            )?.display_name || "All"
          }</p>
          <table>
            <thead>
              <tr><th>#</th><th>Block Name</th></tr>
            </thead>
            <tbody>
              ${filteredBlocks
                .map(
                  (block, index) =>
                    `<tr><td>${index + 1}</td><td>${
                      block.display_name
                    }</td></tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      console.log("Generating PDF...");

      const { uri } = await Print.printToFileAsync({ html });

      console.log("PDF generated at:", uri);

      const pdfName = `${eventTitle}_BlockList.pdf`;
      const pdfPath = `${FileSystem.documentDirectory}${pdfName}`;

      await FileSystem.moveAsync({
        from: uri,
        to: pdfPath,
      });

      console.log("PDF moved to:", pdfPath);

      console.log("Sharing PDF:", pdfPath);

      await Sharing.shareAsync(pdfPath, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });

      console.log("PDF shared successfully");
    } catch (error) {
      console.error("Error saving/sharing PDF:", error);
    }
  };

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
        <CustomButton
          title="Download"
          onPress={() => setShowPrintModal(true)}
        />
      </View>

      <PrintFilterModal
        visible={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onPrint={handleSavePDF}
        showDepartment={true}
        showBlock={true}
        showYearLevel={true}
        departments={departments}
        blocks={blocks.map((block) => ({
          label: block.display_name,
          value: String(block.block_id),
        }))}
        yearLevels={yearLevels}
      />
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
