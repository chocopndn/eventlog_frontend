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
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [errorDepartments, setErrorDepartments] = useState(null);

  const [blocks, setBlocks] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [errorBlocks, setErrorBlocks] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      setErrorDepartments(null);
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
            value: dept.department_id,
          }));
          setDepartments(dropdownData);
        } else {
          setErrorDepartments(
            new Error(
              "Invalid data format from API: Expected a successful response with a 'departments' array."
            )
          );
        }
      } catch (err) {
        setErrorDepartments(err);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchBlocks = async (departmentId) => {
      if (!departmentId) {
        setBlocks([]);
        return;
      }
      setLoadingBlocks(true);
      setErrorBlocks(null);
      try {
        const response = await fetch(API_URL + `/api/blocks/${departmentId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        if (
          responseData &&
          responseData.success &&
          Array.isArray(responseData.data)
        ) {
          const dropdownData = responseData.data.map((block) => ({
            label: block.name,
            value: block.id,
          }));
          setBlocks(dropdownData);
        } else {
          const errorMessage = `Invalid data format from API: Expected a successful response with a 'data' array containing blocks. Response was: ${JSON.stringify(
            responseData
          )}`;
          setErrorBlocks(new Error(errorMessage));
        }
      } catch (err) {
        setErrorBlocks(err);
      } finally {
        setLoadingBlocks(false);
      }
    };

    if (selectedDepartment) {
      fetchBlocks(selectedDepartment);
    } else {
      setBlocks([]);
    }
  }, [selectedDepartment]);

  const handleDepartmentSelect = (value) => {
    setSelectedDepartment(value);
    setSelectedBlocks([]);
  };

  const handleBlockSelect = (values) => {
    setSelectedBlocks(values);
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
            {loadingDepartments ? (
              <Text>Loading Departments...</Text>
            ) : errorDepartments ? (
              <Text style={{ color: "red" }}>
                Error: {errorDepartments.message}
              </Text>
            ) : (
              <CustomDropdown
                placeholder="Select Department"
                title="Department"
                data={departments}
                display="sharp"
                onSelect={handleDepartmentSelect}
                value={selectedDepartment}
              />
            )}

            {loadingBlocks ? (
              <Text>Loading Blocks...</Text>
            ) : errorBlocks ? (
              <Text style={{ color: "red" }}>Error: {errorBlocks.message}</Text>
            ) : (
              <CustomDropdown
                placeholder="Select Block/s"
                title="Block/s Included"
                data={blocks}
                display="sharp"
                onSelect={handleBlockSelect}
                value={selectedBlocks}
                isMultiSelect={true}
                placeholder={
                  blocks.length === 0 ? "No Blocks Available" : "Select Block/s"
                }
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
