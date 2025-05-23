import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  fetchBlocksOfEvents,
  fetchAttendanceSummaryPerBlock,
} from "../../../../services/api/records";
import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import CustomButton from "../../../../components/CustomButton";
import CustomDropdown from "../../../../components/CustomDropdown";
import CustomSearch from "../../../../components/CustomSearch";
import PrintFilterModal from "../../../../components/PrintFilterModal";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import CustomModal from "../../../../components/CustomModal";

const BlockList = () => {
  const { eventId } = useLocalSearchParams();
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "success",
    cancelTitle: "OK",
  });

  useEffect(() => {
    if (!eventId) return;
    const loadEventData = async () => {
      try {
        setLoading(true);
        const event_id = Number(eventId);
        const blocksData = await fetchBlocksOfEvents(event_id, "", "");
        if (!blocksData.success) throw new Error("Failed to load blocks");

        const eventTitle =
          blocksData.data?.event_title || "Event Title Not Found";
        setEventTitle(eventTitle);

        const mappedBlocks =
          blocksData.data?.blocks?.map((block) => ({
            ...block,
            display_name: block.course_code
              ? `${block.course_code} ${block.block_name}`
              : block.block_name,
          })) || [];
        setAllBlocks(mappedBlocks);
        setBlocks(mappedBlocks);

        const uniqueDepartments = [
          ...new Set(mappedBlocks.map((b) => b.department_id)),
        ];
        const deptOptions = uniqueDepartments.map((deptId) => ({
          label: mappedBlocks.find((b) => b.department_id === deptId)
            ?.course_code,
          value: String(deptId),
        }));
        const departmentsWithAll = [
          { label: "All Departments", value: "" },
          ...deptOptions,
        ];
        setDepartments(departmentsWithAll);

        const uniqueYearLevels = [
          ...new Set(mappedBlocks.map((b) => b.year_level_id)),
        ];
        const yearOptions = uniqueYearLevels.map((yearId) => ({
          label: `Year ${yearId}`,
          value: String(yearId),
        }));
        setYearLevels(yearOptions);
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
    if (!eventId || (!selectedDepartment && !selectedYearLevel)) return;
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
    const filtered = allBlocks.filter((block) =>
      (block.display_name || "").toLowerCase().includes(lowerQuery)
    );
    setBlocks(filtered);
  }, [searchQuery, allBlocks]);

  const handleSavePDF = async (filters) => {
    try {
      const { departmentIds, blockIds, yearLevelIds } = filters;
      const filteredBlocks = allBlocks.filter((block) => {
        const departmentMatch =
          departmentIds.length === 0 ||
          departmentIds.includes(String(block.department_id));
        const yearLevelMatch =
          yearLevelIds.length === 0 ||
          yearLevelIds.includes(String(block.year_level_id));
        const blockMatch =
          blockIds.length === 0 || blockIds.includes(String(block.block_id));
        return departmentMatch && yearLevelMatch && blockMatch;
      });

      if (filteredBlocks.length === 0) {
        alert("No blocks match the selected filters.");
        return;
      }

      const startDate = new Date(2025, 4, 20);
      const endDate = new Date(2025, 4, 26);
      const formatDate = (date) =>
        date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      let dateString = "";
      if (
        startDate.getDate() === endDate.getDate() &&
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getFullYear() === endDate.getFullYear()
      ) {
        dateString = `${formatDate(startDate)}`;
      } else if (
        startDate.getMonth() === endDate.getMonth() &&
        startDate.getFullYear() === endDate.getFullYear()
      ) {
        dateString = `${startDate.toLocaleDateString("en-US", {
          month: "long",
        })} ${startDate.getDate()}–${endDate.getDate()}, ${startDate.getFullYear()}`;
      } else {
        dateString = `${formatDate(startDate)} – ${formatDate(endDate)}`;
      }

      const attendanceSummaries = await Promise.all(
        filteredBlocks.map(async (block) => {
          try {
            const summary = await fetchAttendanceSummaryPerBlock(
              Number(eventId),
              block.block_id
            );
            return summary;
          } catch (error) {
            return { data: { attendance_summary: [] } };
          }
        })
      );

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: sans-serif; padding: 20px; }
              h1, h5 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #999; padding: 4px; text-align: left; }
            </style>
          </head>
          <body>
            <h1>${eventTitle}</h1>
            <h3>Date: ${dateString}</h3>
            ${filteredBlocks
              .map((block, index) => {
                const summary =
                  attendanceSummaries[index]?.data?.attendance_summary || [];
                return `
                  <h2>${block.display_name}</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Present</th>
                        <th>Absent</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${summary
                        .map(
                          (student) => `
                            <tr>
                              <td>${student.student_id}</td>
                              <td>${student.student_name}</td>
                              <td>${student.present_count}</td>
                              <td>${student.absent_count}</td>
                            </tr>
                          `
                        )
                        .join("")}
                    </tbody>
                  </table>
                `;
              })
              .join("")}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      const pdfName = `${eventTitle}.pdf`;
      const pdfPath = `${FileSystem.documentDirectory}${pdfName}`;
      await FileSystem.moveAsync({ from: uri, to: pdfPath });
      await Sharing.shareAsync(pdfPath, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });

      setModalConfig({
        title: "Download Successful",
        message: "Your PDF has been downloaded successfully.",
        type: "success",
        cancelTitle: "OK",
      });
      setModalVisible(true);
    } catch (error) {
      setModalConfig({
        title: "Download Failed",
        message: "An error occurred while generating the PDF.",
        type: "error",
        cancelTitle: "OK",
      });
      setModalVisible(true);
    }
  };

  const handleBlockPress = (block) => {
    router.push({
      pathname: "/records/StudentsList",
      params: { eventId: eventId, blockId: block.block_id },
    });
  };

  const handleDownloadPress = () => {
    if (allBlocks.length === 0) {
      alert("No blocks available to print. Please add blocks first.");
      return;
    }
    setShowPrintModal(true);
  };

  return (
    <View style={globalStyles.secondaryContainer}>
      <Text style={styles.eventTitle}>{eventTitle}</Text>
      <View style={styles.container}>
        <CustomSearch
          placeholder="Search blocks..."
          onSearch={(text) => setSearchQuery(text)}
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
              onSelect={(item) => setSelectedDepartment(item.value)}
            />
          </View>
          <View style={{ width: "48%" }}>
            <CustomDropdown
              placeholder="Year Level"
              data={yearLevels}
              labelField="label"
              valueField="value"
              value={selectedYearLevel}
              onSelect={(item) => setSelectedYearLevel(item.value)}
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
                  onPress={() => handleBlockPress(block)}
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
        <CustomButton title="Download" onPress={handleDownloadPress} />
      </View>
      <PrintFilterModal
        visible={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onPrint={handleSavePDF}
        showDepartment={true}
        showBlock={true}
        showYearLevel={true}
        departments={departments.filter((dept) => dept.value !== "")}
        blocks={allBlocks}
        yearLevels={yearLevels}
      />
      <CustomModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        cancelTitle={modalConfig.cancelTitle}
        onCancel={() => setModalVisible(false)}
      />
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
