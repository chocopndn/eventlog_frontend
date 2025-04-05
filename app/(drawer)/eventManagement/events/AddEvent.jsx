import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import TabsComponent from "../../../../components/TabsComponent";
import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import CustomDropdown from "../../../../components/CustomDropdown";
import CustomButton from "../../../../components/CustomButton";
import CustomModal from "../../../../components/CustomModal";
import FormField from "../../../../components/FormField";
import TimePickerComponent from "../../../../components/TimePickerComponent";
import DatePickerComponent from "../../../../components/DatePickerComponent";
import DurationPicker from "../../../../components/DurationPicker";
import {
  fetchDepartments,
  fetchEventNames,
  fetchBlocksByDepartment,
  addEvent,
} from "../../../../services/api";
import { getStoredUser } from "../../../../database/queries";

const AddEvent = () => {
  const [formData, setFormData] = useState({
    event_name_id: "",
    department_ids: [],
    block_ids: [],
    venue: "",
    description: "",
    am_in: null,
    am_out: null,
    pm_in: null,
    pm_out: null,
    event_date: null,
    duration: 0,
    created_by: "",
  });
  const [eventNames, setEventNames] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [blockOptions, setBlockOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [errorDepartments, setErrorDepartments] = useState(null);
  const [modal, setModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });
  const [isDurationPickerVisible, setIsDurationPickerVisible] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log("Fetching stored user data...");
        const storedUserData = await getStoredUser();
        if (!storedUserData || !storedUserData.id_number) {
          console.error("Error fetching stored user data:", storedUserData);
          throw new Error("Invalid or missing user ID.");
        }
        console.log("Stored user data fetched successfully:", storedUserData);

        handleChange("created_by", storedUserData.id_number);
      } catch (error) {
        console.error("Error fetching stored user:", error);
        setModal({
          visible: true,
          title: "Error",
          message: "Failed to load user data. Please try again.",
          type: "error",
        });
      }
    };

    const fetchEventNamesData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching event names...");
        const eventNamesData = await fetchEventNames();
        if (!Array.isArray(eventNamesData)) {
          console.error(
            "Error fetching event names: Invalid data format",
            eventNamesData
          );
          throw new Error("Invalid data format from API.");
        }
        console.log("Event names fetched successfully:", eventNamesData);
        const formattedEventNames = eventNamesData.map((name) => ({
          label: name.label || name.name,
          value: name.value || name.id,
        }));
        setEventNames(formattedEventNames);
      } catch (error) {
        console.error("Error fetching event names:", error);
        setModal({
          visible: true,
          title: "Error",
          message: "Failed to load event names. Please try again.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDepartmentData = async () => {
      setLoadingDepartments(true);
      setErrorDepartments(null);
      try {
        console.log("Fetching departments...");
        const response = await fetchDepartments();
        if (!response || !Array.isArray(response.departments)) {
          console.error(
            "Error fetching departments: Invalid data format",
            response
          );
          throw new Error(
            "Invalid data format from API: Expected 'departments' array."
          );
        }
        console.log("Departments fetched successfully:", response.departments);
        const departmentsData = response.departments;
        const formattedDepartments = departmentsData.map((dept) => ({
          label: dept.department_name,
          value: dept.department_id,
        }));
        if (
          formattedDepartments.some(
            (dept) => !dept.label || dept.value === undefined
          )
        ) {
          console.error(
            "Error fetching departments: Invalid department data",
            formattedDepartments
          );
          throw new Error("Invalid department data.");
        }
        setDepartmentOptions(formattedDepartments);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setErrorDepartments(err);
        setModal({
          visible: true,
          title: "Error",
          message: "Failed to load departments. Please try again.",
          type: "error",
        });
      } finally {
        setLoadingDepartments(false);
      }
    };

    initializeData();
    fetchEventNamesData();
    fetchDepartmentData();
  }, []);

  useEffect(() => {
    const fetchBlocksData = async () => {
      setLoadingBlocks(true);
      try {
        console.log(
          "Fetching blocks for departments:",
          formData.department_ids
        );
        const departmentIds = formData.department_ids;
        if (!departmentIds || departmentIds.length === 0) {
          console.log("No departments selected. Clearing block options.");
          setBlockOptions([]);
          return;
        }
        const blocksResponse = await fetchBlocksByDepartment(departmentIds);
        if (!Array.isArray(blocksResponse)) {
          console.error(
            "Error fetching blocks: Invalid API response",
            blocksResponse
          );
          throw new Error("Invalid API response: Expected an array of blocks.");
        }
        console.log("Blocks fetched successfully:", blocksResponse);
        const activeBlocks = blocksResponse.filter(
          (block) => block.status === "Active"
        );
        const formattedBlocks = activeBlocks.map((block) => ({
          label: block.block_name,
          value: block.block_id,
        }));
        setBlockOptions(formattedBlocks);
      } catch (error) {
        console.error("Error fetching blocks:", error);
        setModal({
          visible: true,
          title: "Error",
          message: "Failed to load blocks. Please try again.",
          type: "error",
        });
      } finally {
        setLoadingBlocks(false);
      }
    };
    fetchBlocksData();
  }, [formData.department_ids]);

  const handleChange = (name, value) => {
    console.log(`Form field updated: ${name} ->`, value);
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting form data:", formData);

      if (!formData.event_name_id || !formData.venue || !formData.event_date) {
        console.warn("Validation failed: Missing required fields");
        setModal({
          visible: true,
          title: "Validation Error",
          message: "Please fill in all required fields.",
          type: "error",
        });
        return;
      }

      const formattedDates = Array.isArray(formData.event_date)
        ? formData.event_date.flat().filter(Boolean)
        : [];

      if (formattedDates.length === 0) {
        console.warn("Validation failed: Event date is missing or invalid.");
        setModal({
          visible: true,
          title: "Validation Error",
          message: "Please select a valid event date.",
          type: "error",
        });
        return;
      }

      const requestData = {
        event_name_id: formData.event_name_id,
        venue: formData.venue,
        dates: formattedDates,
        description: formData.description,
        block_ids: formData.block_ids,
        am_in: formData.am_in,
        am_out: formData.am_out,
        pm_in: formData.pm_in,
        pm_out: formData.pm_out,
        duration: formData.duration,
        admin_id_number: formData.created_by,
      };

      console.log("Sending request to API with data:", requestData);
      const response = await addEvent(requestData);

      if (response.success) {
        console.log("Event added successfully:", response);
        setModal({
          visible: true,
          title: "Success",
          message: "Event added successfully!",
          type: "success",
        });
        setFormData({
          event_name_id: "",
          department_ids: [],
          block_ids: [],
          venue: "",
          description: "",
          am_in: null,
          am_out: null,
          pm_in: null,
          pm_out: null,
          event_date: null,
          duration: 0,
          created_by: formData.created_by,
        });
      } else {
        console.error("API returned failure response:", response);
        setModal({
          visible: true,
          title: "Error",
          message: response.message || "Failed to add event. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting event:", error);
      setModal({
        visible: true,
        title: "Error",
        message: "An unexpected error occurred. Please try again.",
        type: "error",
      });
    }
  };

  const handleModalClose = () => {
    console.log("Closing modal...");
    setModal({ ...modal, visible: false });
  };

  const handleDateChange = (date) => {
    console.log("Event date changed:", date);
    handleChange("event_date", date);
  };

  const openDurationPicker = () => {
    console.log("Opening duration picker...");
    setIsDurationPickerVisible(true);
  };

  const closeDurationPicker = () => {
    console.log("Closing duration picker...");
    setIsDurationPickerVisible(false);
  };

  const handleDurationSelect = (durationInMinutes) => {
    console.log("Duration selected:", durationInMinutes);
    handleChange("duration", durationInMinutes);
    closeDurationPicker();
  };

  if (isLoading || loadingDepartments) {
    console.log("Component is loading...");
    return (
      <View style={globalStyles.secondaryContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (errorDepartments) {
    console.error("Error loading departments:", errorDepartments);
    return (
      <View style={globalStyles.secondaryContainer}>
        <Text style={{ color: "red", textAlign: "center" }}>
          Failed to load departments. Please try again.
        </Text>
        <CustomButton
          title="Retry"
          onPress={() => {
            console.log("Retrying department fetch...");
            setLoadingDepartments(true);
            setErrorDepartments(null);
            fetchDepartmentData();
          }}
        />
      </View>
    );
  }

  return (
    <View style={[globalStyles.secondaryContainer, { paddingTop: 0 }]}>
      <CustomModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={handleModalClose}
        cancelTitle="CLOSE"
      />
      <Text style={styles.textHeader}>EVENTLOG</Text>
      <View style={styles.titleContainer}>
        <Text style={styles.textTitle}>ADD EVENT</Text>
      </View>
      <ScrollView
        style={styles.scrollviewContainer}
        contentContainerStyle={styles.scrollview}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <CustomDropdown
            title="Select Event Name"
            data={eventNames}
            placeholder="Select an event name"
            value={formData.event_name_id}
            onSelect={(item) => handleChange("event_name_id", item.value)}
          />
          <CustomDropdown
            title="Select Departments"
            data={departmentOptions}
            placeholder="Select departments"
            value={formData.department_ids}
            onSelect={(selectedItems) => {
              const selectedValues = Array.isArray(selectedItems)
                ? selectedItems.map((item) =>
                    typeof item === "object" && item !== null
                      ? item.value
                      : item
                  )
                : [];
              handleChange("department_ids", selectedValues);
            }}
            multiSelect
          />
          {loadingBlocks ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <CustomDropdown
              title="Select Blocks"
              data={blockOptions}
              placeholder="Select blocks"
              value={formData.block_ids}
              onSelect={(selectedItems) => {
                const selectedValues = Array.isArray(selectedItems)
                  ? selectedItems.map((item) =>
                      typeof item === "object" && item !== null
                        ? item.value
                        : item
                    )
                  : [];
                handleChange("block_ids", selectedValues);
              }}
              multiSelect
            />
          )}
          <FormField
            title="Venue"
            placeholder="Enter venue details"
            value={formData.venue}
            onChangeText={(text) => handleChange("venue", text)}
          />
          <FormField
            title="Description"
            placeholder="Enter event description..."
            value={formData.description}
            onChangeText={(text) => handleChange("description", text)}
            multiline={true}
          />
          <DatePickerComponent
            title="Date of Event"
            onDateChange={handleDateChange}
            selectedDate={formData.event_date}
          />
          <View>
            <View style={styles.timeWrapper}>
              <View style={styles.timeContainer}>
                <TimePickerComponent
                  title="AM Time In"
                  mode="single"
                  onTimeChange={(time) => handleChange("am_in", time)}
                />
              </View>
              <View style={styles.timeContainer}>
                {formData.am_in && (
                  <TimePickerComponent
                    title="AM Time Out"
                    mode="single"
                    onTimeChange={(time) => handleChange("am_out", time)}
                  />
                )}
              </View>
            </View>
          </View>
          <View>
            <View style={styles.timeWrapper}>
              <View style={styles.timeContainer}>
                <TimePickerComponent
                  title="PM Time In"
                  mode="single"
                  onTimeChange={(time) => handleChange("pm_in", time)}
                />
              </View>
              <View style={styles.timeContainer}>
                {formData.pm_in && (
                  <TimePickerComponent
                    title="PM Time Out"
                    mode="single"
                    onTimeChange={(time) => handleChange("pm_out", time)}
                  />
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.durationButton}
              onPress={openDurationPicker}
            >
              <Text style={styles.durationButtonText}>
                Set Duration:{" "}
                {formData.duration > 0
                  ? `${Math.floor(formData.duration / 60)} hrs ${
                      formData.duration % 60
                    } mins`
                  : "Not set"}
              </Text>
            </TouchableOpacity>
            {isDurationPickerVisible && (
              <DurationPicker
                visible={isDurationPickerVisible}
                onClose={closeDurationPicker}
                onDurationSelect={handleDurationSelect}
                selectedDuration={formData.duration}
                key={isDurationPickerVisible ? "visible" : "hidden"}
              />
            )}
          </View>
          <View style={styles.buttonContainer}>
            <CustomButton title="SUBMIT" onPress={handleSubmit} />
          </View>
        </View>
      </ScrollView>
      <TabsComponent />
      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  textHeader: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.title,
    textAlign: "center",
    marginBottom: theme.spacing.small,
  },
  scrollviewContainer: {
    width: "100%",
    marginBottom: 90,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderTopWidth: 0,
  },
  scrollview: {
    justifyContent: "space-between",
    flexGrow: 1,
    padding: theme.spacing.medium,
  },
  titleContainer: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  textTitle: {
    fontSize: theme.fontSizes.extraLarge,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
  },
  buttonContainer: {
    marginTop: theme.spacing.medium,
  },
  timeWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  timeContainer: {
    width: "45%",
  },
  durationButton: {
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginTop: theme.spacing.medium,
    alignItems: "center",
    justifyContent: "center",
    height: 50,
  },
  durationButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fontFamily.Arial,
  },
});

export default AddEvent;
