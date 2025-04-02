import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import TabsComponent from "../../../../components/TabsComponent";
import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import CustomDropdown from "../../../../components/CustomDropdown";
import CustomButton from "../../../../components/CustomButton";
import CustomModal from "../../../../components/CustomModal";
import { fetchDepartments, fetchEventNames } from "../../../../services/api";

const AddEvent = () => {
  const [formData, setFormData] = useState({
    event_name_id: "",
    department_ids: [],
  });

  const [eventNames, setEventNames] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [errorDepartments, setErrorDepartments] = useState(null);
  const [modal, setModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  useEffect(() => {
    const fetchEventNamesData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching event names...");
        const eventNamesData = await fetchEventNames();
        console.log("Raw Event Names Data:", eventNamesData);

        if (Array.isArray(eventNamesData)) {
          const formattedEventNames = eventNamesData.map((name) => ({
            label: name.label || name.name,
            value: name.value || name.id,
          }));
          console.log("Formatted Event Names:", formattedEventNames);
          setEventNames(formattedEventNames);
        } else {
          console.error("Invalid event names data format:", eventNamesData);
          throw new Error("Invalid data format from API.");
        }
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

    fetchEventNamesData();
  }, []);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      console.log("Fetching departments...");
      setLoadingDepartments(true);
      setErrorDepartments(null);

      try {
        console.log("Calling fetchDepartments...");
        const departmentsData = await fetchDepartments();
        console.log("Departments Data from fetchDepartments:", departmentsData);

        if (!Array.isArray(departmentsData)) {
          console.error("Invalid departments data format:", departmentsData);
          throw new Error("Invalid data format from API: Expected an array.");
        }

        const formattedDepartments = departmentsData.map((dept) => ({
          label: dept.label,
          value: dept.value,
        }));

        if (
          formattedDepartments.some(
            (dept) => !dept.label || dept.value === undefined
          )
        ) {
          console.warn(
            "Some formatted departments have missing label or value:",
            formattedDepartments
          );
          setErrorDepartments(new Error("Invalid department data."));
          return;
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

    fetchDepartmentData();
  }, []);

  const handleChange = (name, value) => {
    console.log(`Form field "${name}" updated with value:`, value);
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleDepartmentChange = (selectedItems) => {
    const validSelectedItems = selectedItems.filter(
      (item) =>
        typeof item === "object" && item !== null && item.value !== undefined
    );

    const selectedValues = validSelectedItems.map((item) => item.value);
    console.log("Selected departments:", selectedValues);
    handleChange("department_ids", selectedValues);
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting form data:", formData);

      if (!formData.event_name_id.trim()) {
        console.warn("Event name is missing.");
        setModal({
          visible: true,
          title: "Warning",
          message: "Please select an event name.",
          type: "warning",
        });
        return;
      }

      if (formData.department_ids.length === 0) {
        console.warn("No departments selected.");
        setModal({
          visible: true,
          title: "Warning",
          message: "Please select at least one department.",
          type: "warning",
        });
        return;
      }

      console.log("Form submission successful.");
      setModal({
        visible: true,
        title: "Success",
        message: "Event and department selected successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setModal({
        visible: true,
        title: "Error",
        message:
          error.response?.data?.message ||
          "Failed to add event. Please try again.",
        type: "error",
      });
    }
  };

  if (isLoading || loadingDepartments) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (errorDepartments) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <Text style={{ color: "red", textAlign: "center" }}>
          Failed to load departments. Please try again.
        </Text>
        <CustomButton title="Retry" onPress={fetchDepartmentData} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.secondaryContainer, { paddingTop: 0 }]}>
      {/* Modal for Alerts */}
      <CustomModal
        visible={modal.visible}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({ ...modal, visible: false })}
        cancelTitle="CLOSE"
      />

      {/* Header */}
      <Text style={styles.textHeader}>EVENTLOG</Text>
      <View style={styles.titleContainer}>
        <Text style={styles.textTitle}>ADD EVENT</Text>
      </View>

      {/* Scroll View */}
      <ScrollView
        style={styles.scrollviewContainer}
        contentContainerStyle={styles.scrollview}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Event Name Dropdown */}
          <CustomDropdown
            title="Select Event Name"
            data={eventNames}
            placeholder="Select an event name"
            value={formData.event_name_id}
            onSelect={(item) => handleChange("event_name_id", item.value)}
          />

          {/* Department Dropdown (Multi-Select) */}
          <CustomDropdown
            title="Select Departments"
            data={departmentOptions}
            placeholder="Select departments"
            value={formData.department_ids}
            onSelect={handleDepartmentChange}
            multiSelect
          />

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <CustomButton title="SUBMIT" onPress={handleSubmit} />
          </View>
        </View>
      </ScrollView>

      {/* Tabs and Status Bar */}
      <TabsComponent />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default AddEvent;

const styles = StyleSheet.create({
  textHeader: {
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.display,
    color: theme.colors.primary,
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
});
