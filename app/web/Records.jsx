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
        console.log("Attendance data fetched successfully:", students);
        console.log("Event info:", eventDetails);
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

  const filteredData = useMemo(() => {
    return attendanceData.filter((student) => {
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

      const matchesDepartment =
        !selectedDepartment ||
        (student.department_code &&
          student.department_code === selectedDepartment);

      const matchesYearLevel =
        !selectedYearLevel ||
        (student.year_level &&
          student.year_level.toString() === selectedYearLevel);

      return matchesSearch && matchesDepartment && matchesYearLevel;
    });
  }, [attendanceData, searchQuery, selectedDepartment, selectedYearLevel]);

  const departments = useMemo(() => {
    const depts = [
      ...new Set(
        attendanceData.map((student) => student.department_code).filter(Boolean)
      ),
    ];
    return depts.map((dept) => ({ label: dept, value: dept }));
  }, [attendanceData]);

  const yearLevels = useMemo(() => {
    const years = [
      ...new Set(
        attendanceData.map((student) => student.year_level).filter(Boolean)
      ),
    ];
    return years
      .sort()
      .map((year) => ({ label: `Year ${year}`, value: year.toString() }));
  }, [attendanceData]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value);
  };

  const handleYearLevelChange = (value) => {
    setSelectedYearLevel(value);
  };

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
            onSelect={handleDepartmentChange}
            selectedValue={selectedDepartment}
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
            onSelect={handleYearLevelChange}
            selectedValue={selectedYearLevel}
          />
        </View>
      </View>

      {/* Clear filters button */}
      {(searchQuery || selectedDepartment || selectedYearLevel) && (
        <View style={styles.clearFiltersContainer}>
          <CustomButton
            title="Clear Filters"
            onPress={clearFilters}
            style={styles.clearFiltersButton}
          />
        </View>
      )}

      {/* Results count */}
      {!loading && !error && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            Showing {filteredData.length} of {attendanceData.length} students
          </Text>
        </View>
      )}

      {/* Fixed Table Header */}
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
  clearFiltersContainer: {
    width: "90%",
    alignItems: "center",
    marginTop: theme.spacing.medium,
  },
  clearFiltersButton: {
    width: "30%",
  },
  resultsContainer: {
    width: "90%",
    alignItems: "center",
    marginTop: theme.spacing.small,
    marginBottom: theme.spacing.small,
  },
  resultsText: {
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.small,
    color: theme.colors.text || "#666",
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
