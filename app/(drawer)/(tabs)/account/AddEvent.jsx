import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { API_URL } from "../../../../config/config";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

import CustomDropdown from "../../../../components/CustomDropdown";
import FormField from "../../../../components/FormField";

const AddEvent = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [errorDepartments, setErrorDepartments] = useState(null);

  const [blocks, setBlocks] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [errorBlocks, setErrorBlocks] = useState(null);

  const [eventNames, setEventNames] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loadingEventNames, setLoadingEventNames] = useState(true);
  const [errorEventNames, setErrorEventNames] = useState(null);

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
            label: dept.department_code,
            value: dept.department_id,
          }));
          setDepartments(dropdownData);
        } else {
          setErrorDepartments(
            new Error("Invalid data format from API: Expected an array.")
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
    const fetchBlocks = async () => {
      if (selectedDepartments.length === 0) {
        setBlocks([]);
        return;
      }
      setLoadingBlocks(true);
      setErrorBlocks(null);
      try {
        const blockRequests = selectedDepartments.map((departmentId) =>
          fetch(API_URL + `/api/blocks/${departmentId}`).then((res) =>
            res.json()
          )
        );
        const responses = await Promise.all(blockRequests);

        let mergedBlocks = [];
        responses.forEach((responseData) => {
          if (
            responseData &&
            responseData.success &&
            Array.isArray(responseData.data)
          ) {
            mergedBlocks = [...mergedBlocks, ...responseData.data];
          }
        });

        const uniqueBlocks = Array.from(
          new Map(mergedBlocks.map((block) => [block.id, block])).values()
        ).map((block) => ({ label: block.name, value: block.id }));

        setBlocks(uniqueBlocks);
      } catch (err) {
        setErrorBlocks(err);
      } finally {
        setLoadingBlocks(false);
      }
    };

    fetchBlocks();
  }, [selectedDepartments]);

  useEffect(() => {
    const fetchEventNames = async () => {
      setLoadingEventNames(true);
      setErrorEventNames(null);
      try {
        const response = await fetch(API_URL + "/api/events/names");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        if (
          responseData &&
          responseData.success &&
          Array.isArray(responseData.eventNames)
        ) {
          const dropdownData = responseData.eventNames.map((event) => ({
            label: event.name,
            value: event.id,
          }));
          setEventNames(dropdownData);
        } else {
          setErrorEventNames(
            new Error("Invalid data format from API: Expected an array.")
          );
        }
      } catch (err) {
        setErrorEventNames(err);
      } finally {
        setLoadingEventNames(false);
      }
    };

    fetchEventNames();
  }, []);

  const handleDepartmentSelect = (values) => {
    setSelectedDepartments(values);
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
                value={selectedDepartments}
                multiSelect={true}
              />
            )}

            {loadingBlocks ? (
              <Text>Loading Blocks...</Text>
            ) : errorBlocks ? (
              <Text style={{ color: "red" }}>Error: {errorBlocks.message}</Text>
            ) : (
              <CustomDropdown
                title="Block/s Included"
                data={blocks}
                display="sharp"
                onSelect={handleBlockSelect}
                value={selectedBlocks}
                placeholder={
                  blocks.length === 0 ? "No Blocks Available" : "Select Block/s"
                }
                multiSelect={true}
              />
            )}

            {loadingEventNames ? (
              <Text>Loading Events...</Text>
            ) : errorEventNames ? (
              <Text style={{ color: "red" }}>
                Error: {errorEventNames.message}
              </Text>
            ) : (
              <CustomDropdown
                title="Name of Event"
                data={eventNames}
                display="sharp"
                onSelect={(value) => setSelectedEvent(value)}
                value={selectedEvent}
                placeholder="Select Event"
              />
            )}

            <FormField
              type="text"
              borderColor="primary"
              title="Venue"
              design="sharp"
            />
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
