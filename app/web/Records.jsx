import { StyleSheet, Text, View, ScrollView, Platform } from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { useFonts } from "expo-font";
import WebHeader from "../../components/WebHeader";
import globalStyles from "../../constants/globalStyles";
import CustomSearch from "../../components/CustomSearch";
import CustomDropdown from "../../components/CustomDropdown";
import CustomButton from "../../components/CustomButton";
import theme from "../../constants/theme";
import ArialFont from "../../assets/fonts/Arial.ttf";
import ArialBoldFont from "../../assets/fonts/ArialBold.ttf";
import ArialItalicFont from "../../assets/fonts/ArialItalic.ttf";
import SquadaOneFont from "../../assets/fonts/SquadaOne.ttf";
import { fetchAttendanceSummaryOfEvent } from "../../services/api/records";
import { fetchDepartments, fetchYearLevels } from "../../services/api";

const Records = () => {
  const { eventId } = useLocalSearchParams();
  const [fontsLoaded, fontError] = useFonts({
    Arial: require("../../assets/fonts/Arial.ttf"),
    ArialBold: require("../../assets/fonts/ArialBold.ttf"),
    ArialItalic: require("../../assets/fonts/ArialItalic.ttf"),
    SquadaOne: require("../../assets/fonts/SquadaOne.ttf"),
  });

  const [fontsReady, setFontsReady] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedYearLevel, setSelectedYearLevel] = useState("");

  // State for department/year level options
  const [departments, setDepartments] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);

  // Load web fonts
  useEffect(() => {
    if (Platform.OS === "web") {
      console.log("Records: Registering fonts for web...");
      const style = document.createElement("style");
      style.textContent = `
        @font-face {
          font-family: 'Arial';
          src: url('${ArialFont}') format('truetype');
          font-display: swap;
        }
        @font-face {
          font-family: 'ArialBold';
          src: url('${ArialBoldFont}') format('truetype');
          font-display: swap;
          font-weight: bold;
        }
        @font-face {
          font-family: 'ArialItalic';
          src: url('${ArialItalicFont}') format('truetype');
          font-display: swap;
          font-style: italic;
        }
        @font-face {
          font-family: 'SquadaOne';
          src: url('${SquadaOneFont}') format('truetype');
          font-display: swap;
        }
      `;
      const existingStyle = document.getElementById("records-custom-fonts");
      if (!existingStyle) {
        style.id = "records-custom-fonts";
        document.head.appendChild(style);
        console.log("Records: Font CSS added to document");
      }

      if (document.fonts) {
        Promise.all([
          document.fonts.load("16px Arial"),
          document.fonts.load("16px ArialBold"),
          document.fonts.load("16px ArialItalic"),
          document.fonts.load("16px SquadaOne"),
        ])
          .then(() => {
            console.log("Records: All fonts loaded successfully");
            setFontsReady(true);
          })
          .catch((error) => {
            console.warn("Records: Font loading failed:", error);
            setFontsReady(true);
          });
      } else {
        setTimeout(() => {
          console.log("Records: Using fallback font loading method");
          setFontsReady(true);
        }, 500);
      }
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" && fontsLoaded && !fontError) {
      setFontsReady(true);
    }
  }, [fontsLoaded, fontError]);

  // Fetch attendance data and extract dropdown options from the response
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!eventId) {
        console.warn("No eventId provided");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching attendance data for eventId:", eventId);
        const response = await fetchAttendanceSummaryOfEvent(eventId);
        const students = response?.data?.students || [];
        const eventDetails = {
          id: response?.data?.event_id,
          name: response?.data?.event_name,
          status: response?.data?.event_status,
        };

        setAttendanceData(students);
        setEventInfo(eventDetails);

        // Extract unique departments and year levels from student data
        const uniqueDepartments = new Map();
        const uniqueYearLevels = new Map();

        students.forEach((student) => {
          // Collect departments
          if (student.department_code && student.department_name) {
            uniqueDepartments.set(student.department_code, {
              label: `${student.department_code} - ${student.department_name}`,
              value: student.department_code,
            });
          }

          // Collect year levels from the response data
          if (student.year_level_id && student.year_level_name) {
            uniqueYearLevels.set(student.year_level_id, {
              label: student.year_level_name,
              value: String(student.year_level_id),
            });
          }
        });

        // If we have departments and year_levels arrays from the API response, use those instead
        if (
          response?.data?.departments &&
          Array.isArray(response.data.departments)
        ) {
          response.data.departments.forEach((dept) => {
            uniqueDepartments.set(dept.code, {
              label: `${dept.code} - ${dept.name}`,
              value: dept.code,
            });
          });
        }

        if (
          response?.data?.year_levels &&
          Array.isArray(response.data.year_levels)
        ) {
          response.data.year_levels.forEach((year) => {
            uniqueYearLevels.set(year.id, {
              label: year.name,
              value: String(year.id),
            });
          });
        }

        // Create department options
        const departmentOptions = [
          { label: "All Departments", value: "" },
          ...Array.from(uniqueDepartments.values()).sort((a, b) =>
            a.label.localeCompare(b.label)
          ),
        ];

        // Create year level options
        const yearLevelOptions = [
          { label: "All Year Levels", value: "" },
          ...Array.from(uniqueYearLevels.values()).sort((a, b) =>
            a.label.localeCompare(b.label)
          ),
        ];

        setDepartments(departmentOptions);
        setYearLevels(yearLevelOptions);

        console.log("Attendance data fetched successfully:", students);
        console.log("Event info:", eventDetails);
        console.log("Departments from data:", departmentOptions);
        console.log("Year levels from data:", yearLevelOptions);
      } catch (err) {
        console.error("Failed to fetch attendance data:", err);
        setError(err.message || "Failed to fetch attendance data");
      } finally {
        setLoading(false);
      }
    };

    if (fontsReady) {
      fetchAttendanceData();
    }
  }, [eventId, fontsReady]);

  // Separate useEffect for API-based dropdowns (fallback)
  useEffect(() => {
    const loadOptionsFromAPI = async () => {
      try {
        // Only fetch from API if we don't have data from attendance response
        if (departments.length <= 1) {
          // Only "All Departments"
          console.log("Fetching departments from API as fallback...");
          const deptResponse = await fetchDepartments();
          console.log("API Department response:", deptResponse);

          if (deptResponse?.data && Array.isArray(deptResponse.data)) {
            const deptOptions = deptResponse.data.map((dept, index) => ({
              label: String(
                dept.name ||
                  dept.department_name ||
                  dept.code ||
                  `Department ${index + 1}`
              ),
              value: String(dept.code || dept.id || index),
            }));

            const departmentOptions = [
              { label: "All Departments", value: "" },
              ...deptOptions,
            ];

            setDepartments(departmentOptions);
            console.log("API-based departments:", departmentOptions);
          }
        }

        if (yearLevels.length <= 1) {
          // Only "All Year Levels"
          console.log("Fetching year levels from API as fallback...");
          const yearResponse = await fetchYearLevels();
          console.log("API Year response:", yearResponse);

          if (yearResponse?.data && Array.isArray(yearResponse.data)) {
            const yearOptions = yearResponse.data.map((year, index) => ({
              label: `Year ${
                year.level || year.year_level || year.name || index + 1
              }`,
              value: String(
                year.level || year.year_level || year.id || index + 1
              ),
            }));

            const yearLevelOptions = [
              { label: "All Year Levels", value: "" },
              ...yearOptions,
            ];

            setYearLevels(yearLevelOptions);
            console.log("API-based year levels:", yearLevelOptions);
          }
        }
      } catch (error) {
        console.error("Error fetching dropdown data from API:", error);
      }
    };

    // Run this after attendance data is loaded and if dropdowns are still empty
    if (fontsReady && attendanceData.length > 0) {
      loadOptionsFromAPI();
    }
  }, [attendanceData, fontsReady]);

  // Enhanced filtering logic with proper field matching
  const filteredData = useMemo(() => {
    return attendanceData.filter((student) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        (student.full_name &&
          student.full_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (student.id_number &&
          student.id_number
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (student.block_name &&
          student.block_name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Department filter - match against department_code
      const matchesDepartment =
        !selectedDepartment ||
        selectedDepartment === "" ||
        selectedDepartment === "error" ||
        (student.department_code &&
          String(student.department_code) === String(selectedDepartment));

      // Year level filter - match against year_level_id field from attendance data
      const matchesYearLevel =
        !selectedYearLevel ||
        selectedYearLevel === "" ||
        selectedYearLevel === "error" ||
        (student.year_level_id &&
          String(student.year_level_id) === String(selectedYearLevel));

      return matchesSearch && matchesDepartment && matchesYearLevel;
    });
  }, [attendanceData, searchQuery, selectedDepartment, selectedYearLevel]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleDepartmentChange = (item) => {
    setSelectedDepartment(item.value);
  };

  const handleYearLevelChange = (item) => {
    setSelectedYearLevel(item.value);
  };

  // Clear filters function - keeping for potential future use
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("");
    setSelectedYearLevel("");
  };

  if (!fontsReady) {
    return (
      <View
        style={[
          globalStyles.secondaryContainer,
          { padding: 0, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text
          style={{
            fontFamily:
              Platform.OS === "web" ? "system-ui, sans-serif" : "system",
            fontSize: 18,
            color: theme.colors.primary,
            marginBottom: 10,
          }}
        >
          Loading...
        </Text>
        {Platform.OS === "web" && (
          <Text
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              color: "#666",
              textAlign: "center",
            }}
          >
            Preparing records interface
          </Text>
        )}
      </View>
    );
  }

  const renderAttendanceRow = (item, index) => (
    <View key={index} style={styles.listRow}>
      <View style={[styles.id, styles.dataCell]}>
        <Text style={styles.dataTextStyle}>{item.id_number || "N/A"}</Text>
      </View>
      <View style={[styles.name, styles.dataCell]}>
        <Text style={styles.dataTextStyle}>{item.full_name || "N/A"}</Text>
      </View>
      <View style={[styles.block, styles.dataCell]}>
        <Text style={styles.dataTextStyle}>{item.block_name || "N/A"}</Text>
      </View>
      <View style={[styles.department, styles.dataCell]}>
        <Text style={styles.dataTextStyle}>
          {item.department_code || "N/A"}
        </Text>
      </View>
      <View style={[styles.present, styles.dataCell]}>
        <Text style={styles.dataTextStyle}>{item.present_count || 0}</Text>
      </View>
      <View style={[styles.absent, styles.dataCell]}>
        <Text style={styles.dataTextStyle}>{item.absent_count || 0}</Text>
      </View>
    </View>
  );

  return (
    <View
      style={[
        globalStyles.secondaryContainer,
        { padding: 0, justifyContent: "flex-start" },
      ]}
    >
      <WebHeader />
      {/* Event Information */}
      {eventInfo && (
        <View style={styles.eventInfoContainer}>
          <Text style={styles.eventTitle}>{eventInfo.name}</Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <CustomSearch
          onSearch={handleSearch}
          value={searchQuery}
          placeholder="Search by name, ID, or block..."
        />
      </View>

      <View style={styles.dropdownWrapper}>
        <View style={styles.dropdownContainer}>
          <CustomDropdown
            display="sharp"
            placeholder="Department"
            data={departments}
            labelField="label"
            valueField="value"
            value={selectedDepartment}
            onSelect={handleDepartmentChange}
          />
        </View>
        <View
          style={[
            styles.dropdownContainer,
            { marginLeft: theme.spacing.medium },
          ]}
        >
          <CustomDropdown
            display="sharp"
            placeholder="Year Level"
            data={yearLevels}
            labelField="label"
            valueField="value"
            value={selectedYearLevel}
            onSelect={handleYearLevelChange}
          />
        </View>
      </View>

      {/* Clear filters button - REMOVED */}

      {/* Results count - REMOVED */}

      {/* Table Header */}
      <View style={styles.tableContainer}>
        <View style={styles.listHeader}>
          <View style={[styles.id, styles.headerText]}>
            <Text style={styles.headerTextStyle}>ID Number</Text>
          </View>
          <View style={[styles.name, styles.headerText]}>
            <Text style={styles.headerTextStyle}>Name</Text>
          </View>
          <View style={[styles.block, styles.headerText]}>
            <Text style={styles.headerTextStyle}>Block</Text>
          </View>
          <View style={[styles.department, styles.headerText]}>
            <Text style={styles.headerTextStyle}>Department</Text>
          </View>
          <View style={[styles.present, styles.headerText]}>
            <Text style={styles.headerTextStyle}>Present</Text>
          </View>
          <View style={[styles.absent, styles.headerText]}>
            <Text style={styles.headerTextStyle}>Absent</Text>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollViewContent}
          contentContainerStyle={styles.scrollView}
        >
          {/* Loading state */}
          {loading && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>Loading attendance data...</Text>
            </View>
          )}

          {/* Error state */}
          {error && (
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: theme.colors.error }]}>
                Error: {error}
              </Text>
            </View>
          )}

          {/* No data state */}
          {!loading && !error && attendanceData.length === 0 && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                {eventId
                  ? "No attendance data found for this event"
                  : "No event selected"}
              </Text>
            </View>
          )}

          {/* No filtered results */}
          {!loading &&
            !error &&
            attendanceData.length > 0 &&
            filteredData.length === 0 && (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                  No students match your search criteria
                </Text>
              </View>
            )}

          {/* Data rows */}
          {!loading && !error && filteredData.length > 0 && (
            <View style={styles.dataContainer}>
              {filteredData.map(renderAttendanceRow)}
            </View>
          )}
        </ScrollView>
      </View>

      <View style={styles.printDlButton}>
        <View style={styles.buttonWrapper}>
          <View style={styles.buttonContainer}>
            <CustomButton
              title="DOWNLOAD"
              disabled={loading || filteredData.length === 0}
            />
          </View>
          <View style={styles.buttonContainer}>
            <CustomButton
              title="PRINT"
              disabled={loading || filteredData.length === 0}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default Records;

const styles = StyleSheet.create({
  searchContainer: {
    width: "90%",
    paddingTop: 20,
  },
  eventInfoContainer: {
    width: "90%",
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  eventTitle: {
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: 50,
    color: theme.colors.primary,
    textAlign: "center",
  },
  eventStatus: {
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.success || "#4CAF50",
    textAlign: "center",
  },
  eventId: {
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.small,
    color: theme.colors.text || "#666",
    textAlign: "center",
  },
  dropdownWrapper: {
    flexDirection: "row",
    marginTop: theme.spacing.large,
    width: "90%",
    justifyContent: "center",
  },
  dropdownContainer: {
    width: "49%",
  },
  buttonContainer: {
    width: "30%",
    padding: theme.spacing.medium,
  },
  buttonWrapper: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  printDlButton: {
    width: "100%",
  },
  scrollView: {
    justifyContent: "center",
    alignItems: "center",
  },
  tableContainer: {
    width: "90%",
    flex: 1,
  },
  scrollViewContent: {
    width: "100%",
    flex: 1,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  headerText: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.primary,
    padding: theme.spacing.small,
  },
  headerTextStyle: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.large,
    textAlign: "center",
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  dataCell: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: theme.spacing.small,
    backgroundColor: theme.colors.secondary,
  },
  dataTextStyle: {
    fontFamily: theme.fontFamily.Arial,
    color: theme.colors.text || "#333",
    fontSize: theme.fontSizes.medium,
    textAlign: "center",
  },
  dataContainer: {
    width: "100%",
  },
  statusContainer: {
    padding: theme.spacing.large,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.text || "#666",
    textAlign: "center",
  },
  id: {
    flex: 1,
  },
  name: {
    flex: 2,
  },
  block: {
    flex: 1,
  },
  department: {
    flex: 1,
  },
  present: {
    flex: 1,
  },
  absent: {
    flex: 1,
  },
});
