import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { API_URL } from "../../../../config/config";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

import CustomDropdown from "../../../../components/CustomDropdown";

const AddEvent = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL + "/api/departments");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        if (
          responseData &&
          responseData.success &&
          Array.isArray(responseData.departments)
        ) {
          const dropdownData = responseData.departments.map((dept) => ({
            label: dept.department_name,
            value: dept.department_code,
          }));
          setDepartments(dropdownData);
        } else {
          setError(
            new Error(
              "Invalid data format from API: Expected a successful response with a 'departments' array."
            )
          );
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleDepartmentSelect = (value) => {
    setSelectedDepartment(value);
  };

  return (
    <SafeAreaView style={[globalStyles.secondaryContainer, { paddingTop: 0 }]}>
      <Text style={styles.title}>EVENTLOG</Text>
      <View style={styles.formWrapper}>
        <View style={styles.eventTitleWrapper}>
          <Text style={styles.addEventTitle}>ADD EVENT</Text>
        </View>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={styles.scrollviewContent}
        >
          <View style={{ width: "100%" }}>
            {loading ? (
              <Text>Loading Departments...</Text>
            ) : (
              <CustomDropdown
                placeholder="Select Department"
                title="Department"
                data={departments}
                display="sharp"
                onSelect={(value) => handleInputChange("department_id", value)}
              />
            )}
            {loading ? (
              <Text>Loading Departments...</Text>
            ) : (
              <CustomDropdown
                placeholder="Select Blocks"
                title="Block/s Included"
                data={departments}
                display="sharp"
                onSelect={(value) => handleInputChange("department_id", value)}
              />
            )}
          </View>
        </ScrollView>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default AddEvent;

const styles = StyleSheet.create({
  title: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.display,
  },
  formWrapper: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    width: "90%",
    marginBottom: theme.spacing.medium,
    alignItems: "center",
  },
  scrollviewContent: {
    alignItems: "center",
    padding: theme.spacing.medium,
  },
  addEventTitle: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.huge,
  },
  eventTitleWrapper: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    width: "100%",
    alignItems: "center",
  },
});
