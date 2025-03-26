import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { API_URL } from "../../../../config/config";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

import CustomDropdown from "../../../../components/CustomDropdown";
import FormField from "../../../../components/FormField";
import DatePickerComponent from "../../../../components/DateTimePicker";
import CustomButton from "../../../../components/CustomButton";
import DurationPicker from "../../../../components/DurationPicker";
import CustomModal from "../../../../components/CustomModal";
import { getStoredUser } from "../../../../database/queries";

const AddEvent = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [errorDepartments, setErrorDepartments] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [isDurationPickerVisible, setDurationPickerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [modalTitle, setModalTitle] = useState("");

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
      if (user && user.id_number) {
        setAdminId(user.id_number);
      }
    };
    loadUser();
  }, []);

  const handleDepartmentSelect = (values) => {
    setSelectedDepartments(values);
    setSelectedBlocks([]);
  };

  const handleBlockSelect = (values) => {
    setSelectedBlocks(values);
  };

  const handleEventNameSelect = (value) => {
    setSelectedEvent(value);
  };

  const handleVenueChange = (text) => {
    setVenue(text);
  };

  const handleDescriptionChange = (text) => {
    setDescription(text);
  };

  const handleDateChange = (date) => {
    if (!date) {
      return;
    }

    if (Array.isArray(date)) {
      setSelectedDates(date.map((d) => new Date(d)));
    } else {
      setSelectedDates([new Date(date)]);
    }
  };

  const handleAmInChange = (time) => {
    const sampleTime = new Date();
    sampleTime.setHours(17);
    sampleTime.setMinutes(21);
    sampleTime.setSeconds(3);
    setAmIn(sampleTime);
  };

  const handleAmOutChange = (time) => {
    const sampleTime = new Date();
    sampleTime.setHours(17);
    sampleTime.setMinutes(21);
    sampleTime.setSeconds(3);
    setAmOut(sampleTime);
  };

  const handlePmInChange = (time) => {
    const sampleTime = new Date();
    sampleTime.setHours(17);
    sampleTime.setMinutes(21);
    sampleTime.setSeconds(3);
    setPmIn(sampleTime);
  };

  const handlePmOutChange = (time) => {
    const sampleTime = new Date();
    sampleTime.setHours(17);
    sampleTime.setMinutes(21);
    sampleTime.setSeconds(3);
    setPmOut(sampleTime);
  };

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
  };

  const handlePostEvent = async () => {
    if (!selectedEvent || !selectedEvent.value) {
      setModalTitle("Error");
      setModalMessage("Please select an event name.");
      setModalType("error");
      setModalVisible(true);
      return;
    }
    if (!venue) {
      setModalTitle("Error");
      setModalMessage("Please enter the venue.");
      setModalType("error");
      setModalVisible(true);
      return;
    }
    if (selectedDepartments.length === 0) {
      setModalTitle("Error");
      setModalMessage("Please select at least one department.");
      setModalType("error");
      setModalVisible(true);
      return;
    }
    if (selectedDates.length === 0 || !Array.isArray(selectedDates)) {
      setModalTitle("Error");
      setModalMessage("Please select at least one valid date for the event.");
      setModalType("error");
      setModalVisible(true);
      return;
    }
    if (!amIn || !amOut || !pmIn || !pmOut) {
      setModalTitle("Error");
      setModalMessage(
        "Please select time in and out for both morning and afternoon."
      );
      setModalType("error");
      setModalVisible(true);
      return;
    }
    if (selectedDuration === 0) {
      setModalTitle("Error");
      setModalMessage("Select scanning duration from the chosen time.");
      setModalType("error");
      setModalVisible(true);
      return;
    }
    if (!adminId) {
      setModalTitle("Error");
      setModalMessage("Admin ID not found. Please try again.");
      setModalType("error");
      setModalVisible(true);
      return;
    }

    const formatTime = (time) =>
      time
        ? `${time.getHours().toString().padStart(2, "0")}:${time
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${time.getSeconds().toString().padStart(2, "0")}`
        : null;

    const eventData = {
      event_name_id: selectedEvent.value,
      venue,
      description,
      department_id: selectedDepartments,
      block_ids: selectedBlocks,
      date:
        selectedDates.length > 0
          ? selectedDates.map((d) => d.toISOString().split("T")[0])
          : null,
      am_in: formatTime(amIn),
      am_out: formatTime(amOut),
      pm_in: formatTime(pmIn),
      pm_out: formatTime(pmOut),
      duration: selectedDuration,
      scan_personnel:
        "Year Level Representatives, Governor, or Year Level Adviser",
      admin_id_number: adminId,
    };

    try {
      const response = await axios.post(
        API_URL + "/api/events/admin/add",
        eventData
      );

      if (response.status === 200 && response.data.success) {
        setModalTitle("Success");
        setModalMessage("Event added successfully!");
        setModalType("success");
        setModalVisible(true);

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
        setModalTitle("Error");
        setModalMessage(response.data?.message || "Failed to add event.");
        setModalType("error");
        setModalVisible(true);
      }
    } catch (error) {
      setModalTitle("Error");
      setModalMessage(
        error.response?.data?.message ||
          "Failed to add event. Please check your network connection."
      );
      setModalType("error");
      setModalVisible(true);
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
              selectedValue={selectedDates}
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
      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalVisible(false)}
      />
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
