import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { API_URL } from "../../../../config/config";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

import CustomDropdown from "../../../../components/CustomDropdown";
import FormField from "../../../../components/FormField";
import DatePickerComponent from "../../../../components/DateTimePicker";
import CustomButton from "../../../../components/CustomButton";
import DurationPicker from "../../../../components/DurationPicker";
import { getStoredUser } from "../../../../database/queries";
import axios from "axios";

const AddEvent = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [errorDepartments, setErrorDepartments] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [isDurationPickerVisible, setDurationPickerVisible] = useState(false);

  const [blocks, setBlocks] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [errorBlocks, setErrorBlocks] = useState(null);

  const [eventNames, setEventNames] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loadingEventNames, setLoadingEventNames] = useState(true);
  const [errorEventNames, setErrorEventNames] = useState(null);

  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [amIn, setAmIn] = useState(null);
  const [amOut, setAmOut] = useState(null);
  const [pmIn, setPmIn] = useState(null);
  const [pmOut, setPmOut] = useState(null);
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      setErrorDepartments(null);
      try {
        const response = await axios.get(API_URL + "/api/departments");
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = response.data;
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
          axios.get(API_URL + `/api/blocks/${departmentId}`)
        );
        const responses = await Promise.all(blockRequests);

        let mergedBlocks = [];
        responses.forEach((response) => {
          const responseData = response.data;
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
        const response = await axios.get(API_URL + "/api/events/names");
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = response.data;
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

  useEffect(() => {
    const loadUser = async () => {
      const user = await getStoredUser();
      if (user && user.admin_id_number) {
        setAdminId(user.admin_id_number);
      }
    };
    loadUser();
  }, []);

  const handleDepartmentSelect = (values) => {
    setSelectedDepartments(values);
    setSelectedBlocks([]);
    console.log("Selected Departments:", values);
  };

  const handleBlockSelect = (values) => {
    setSelectedBlocks(values);
    console.log("Selected Blocks:", values);
  };

  const handleEventNameSelect = (value) => {
    setSelectedEvent(value);
    console.log("Selected Event Name ID:", value);
  };

  const handleVenueChange = (text) => {
    setVenue(text);
    console.log("Venue Input:", text);
  };

  const handleDescriptionChange = (text) => {
    setDescription(text);
    console.log("Description Input:", text);
  };

  const handleDateChange = (dates) => {
    setSelectedDates(dates);
    console.log(
      "Selected Dates:",
      dates ? dates.map((date) => date.toISOString().split("T")[0]) : []
    );
  };

  const handleAmInChange = (time) => {
    const sampleTime = new Date();
    sampleTime.setHours(17);
    sampleTime.setMinutes(21);
    sampleTime.setSeconds(3);
    setAmIn(sampleTime);
    console.log(
      "Morning Time In:",
      `${sampleTime.getHours().toString().padStart(2, "0")}:${sampleTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${sampleTime
        .getSeconds()
        .toString()
        .padStart(2, "0")}`
    );
  };

  const handleAmOutChange = (time) => {
    const sampleTime = new Date();
    sampleTime.setHours(17);
    sampleTime.setMinutes(21);
    sampleTime.setSeconds(3);
    setAmOut(sampleTime);
    console.log(
      "Morning Time Out:",
      `${sampleTime.getHours().toString().padStart(2, "0")}:${sampleTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${sampleTime
        .getSeconds()
        .toString()
        .padStart(2, "0")}`
    );
  };

  const handlePmInChange = (time) => {
    const sampleTime = new Date();
    sampleTime.setHours(17);
    sampleTime.setMinutes(21);
    sampleTime.setSeconds(3);
    setPmIn(sampleTime);
    console.log(
      "Afternoon Time In:",
      `${sampleTime.getHours().toString().padStart(2, "0")}:${sampleTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${sampleTime
        .getSeconds()
        .toString()
        .padStart(2, "0")}`
    );
  };

  const handlePmOutChange = (time) => {
    const sampleTime = new Date();
    sampleTime.setHours(17);
    sampleTime.setMinutes(21);
    sampleTime.setSeconds(3);
    setPmOut(sampleTime);
    console.log(
      "Afternoon Time Out:",
      `${sampleTime.getHours().toString().padStart(2, "0")}:${sampleTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}:${sampleTime
        .getSeconds()
        .toString()
        .padStart(2, "0")}`
    );
  };

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
    console.log("Selected Duration:", duration);
  };

  const handlePostEvent = async () => {
    if (!selectedEvent) {
      Alert.alert("Error", "Please select an event name.");
      return;
    }
    if (!venue) {
      Alert.alert("Error", "Please enter the venue.");
      return;
    }
    if (selectedDepartments.length === 0) {
      Alert.alert("Error", "Please select at least one department.");
      return;
    }
    if (selectedDates.length === 0) {
      Alert.alert("Error", "Please select at least one date for the event.");
      return;
    }
    if (!amIn || !amOut || !pmIn || !pmOut) {
      Alert.alert(
        "Error",
        "Please select time in and out for both morning and afternoon."
      );
      return;
    }
    if (selectedDuration === 0) {
      Alert.alert("Error", "Please select the duration of the event.");
      return;
    }
    if (!adminId) {
      Alert.alert("Error", "Admin ID not found. Please try again.");
      return;
    }

    const formattedAmIn = amIn
      ? `${amIn.getHours().toString().padStart(2, "0")}:${amIn
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${amIn.getSeconds().toString().padStart(2, "0")}`
      : null;
    const formattedAmOut = amOut
      ? `${amOut.getHours().toString().padStart(2, "0")}:${amOut
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${amOut.getSeconds().toString().padStart(2, "0")}`
      : null;
    const formattedPmIn = pmIn
      ? `${pmIn.getHours().toString().padStart(2, "0")}:${pmIn
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${pmIn.getSeconds().toString().padStart(2, "0")}`
      : null;
    const formattedPmOut = pmOut
      ? `${pmOut.getHours().toString().padStart(2, "0")}:${pmOut
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${pmOut.getSeconds().toString().padStart(2, "0")}`
      : null;

    const eventData = {
      event_name_id: selectedEvent.value,
      venue: venue,
      description: description,
      department_id: selectedDepartments,
      block_ids: selectedBlocks,
      date: selectedDates.map((date) => date.toISOString().split("T")[0]),
      am_in: formattedAmIn,
      am_out: formattedAmOut,
      pm_in: formattedPmIn,
      pm_out: formattedPmOut,
      duration: selectedDuration,
      scan_personnel:
        "Year Level Representatives, Governor, or Year Level Adviser",
      admin_id_number: adminId,
    };

    console.log(
      "Data being passed to API:",
      JSON.stringify(eventData, null, 2)
    );

    try {
      const response = await axios.post(
        API_URL + "/api/events/admin/add",
        eventData
      );

      console.log("API Response:", JSON.stringify(response.data, null, 2));

      if (response.status === 200 && response.data.success) {
        Alert.alert("Success", "Event added successfully!");

        setSelectedEvent(null);
        setVenue("");
        setDescription("");
        setSelectedDepartments([]);
        setSelectedBlocks([]);
        setSelectedDates([]);
        setAmIn(null);
        setAmOut(null);
        setPmIn(null);
        setPmOut(null);
        setSelectedDuration(0);
      } else {
        Alert.alert("Error", response.data?.message || "Failed to add event.");
      }
    } catch (error) {
      console.error("Error adding event:", error);
      Alert.alert(
        "Error",
        "Failed to add event. Please check your network connection."
      );
    }
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
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
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
                onSelect={handleEventNameSelect}
                value={selectedEvent}
                placeholder="Select Event"
              />
            )}

            <FormField
              type="text"
              borderColor="primary"
              title="Venue"
              design="sharp"
              value={venue}
              onChangeText={handleVenueChange}
            />
            <FormField
              type="text"
              borderColor="primary"
              title="Description"
              design="sharp"
              multiline={true}
              value={description}
              onChangeText={handleDescriptionChange}
            />

            <DatePickerComponent
              type="date"
              title="Date of Event"
              onDateChange={handleDateChange}
              selectedDates={selectedDates}
              mode="multiple"
            />

            <View style={styles.dateTimeWrapper}>
              <Text style={styles.timeOfDay}>Morning</Text>
              <View style={styles.timePickerContainer}>
                <DatePickerComponent
                  type="time"
                  label="TIME IN"
                  onDateChange={handleAmInChange}
                  selectedValue={amIn}
                />
                <DatePickerComponent
                  type="time"
                  label="TIME OUT"
                  onDateChange={handleAmOutChange}
                  selectedValue={amOut}
                />
              </View>
            </View>
            <View style={styles.dateTimeWrapper}>
              <Text style={styles.timeOfDay}>Afternoon</Text>
              <View style={styles.timePickerContainer}>
                <DatePickerComponent
                  type="time"
                  label="TIME IN"
                  onDateChange={handlePmInChange}
                  selectedValue={pmIn}
                />
                <DatePickerComponent
                  type="time"
                  label="TIME OUT"
                  onDateChange={handlePmOutChange}
                  selectedValue={pmOut}
                />
              </View>
            </View>
            <TouchableOpacity
              style={styles.duration}
              onPress={() => setDurationPickerVisible(true)}
            >
              <Text style={styles.durationText}>
                Select Duration: {selectedDuration} minutes
              </Text>
            </TouchableOpacity>

            <DurationPicker
              visible={isDurationPickerVisible}
              onClose={() => setDurationPickerVisible(false)}
              onDurationSelect={handleDurationSelect}
            />

            <View style={styles.buttonContainer}>
              <CustomButton title="POST" onPress={handlePostEvent} />
            </View>
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
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeOfDay: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
  },
  dateTimeWrapper: {
    marginTop: theme.spacing.medium,
  },
  buttonContainer: {
    marginTop: theme.spacing.medium,
  },
  duration: {
    width: "100%",
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginTop: theme.spacing.medium,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  durationText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
  },
});
