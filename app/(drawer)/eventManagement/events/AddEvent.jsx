import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
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
        const eventNamesData = await fetchEventNames();
        if (!Array.isArray(eventNamesData)) {
          throw new Error("Invalid data format from API.");
        }
        const formattedEventNames = eventNamesData.map((name) => ({
          label: name.label || name.name,
          value: name.value || name.id,
        }));
        setEventNames(formattedEventNames);
      } catch (error) {
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
      setLoadingDepartments(true);
      setErrorDepartments(null);
      try {
        const response = await fetchDepartments();
        if (!response || !Array.isArray(response.departments)) {
          throw new Error(
            "Invalid data format from API: Expected 'departments' array."
          );
        }
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
          setErrorDepartments(new Error("Invalid department data."));
          return;
        }
        setDepartmentOptions(formattedDepartments);
      } catch (err) {
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
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleDepartmentChange = (selectedItems) => {
    const validSelectedItems = Array.isArray(selectedItems)
      ? selectedItems.map((item) => {
          if (
            typeof item === "object" &&
            item !== null &&
            item.value !== undefined
          ) {
            return item;
          } else {
            const department = departmentOptions.find(
              (dept) => dept.value === item
            );
            return department || null;
          }
        })
      : [];
    const filteredSelectedItems = validSelectedItems.filter(
      (item) => item !== null && item.value !== undefined
    );
    const selectedValues = filteredSelectedItems.map((item) => item.value);
    handleChange("department_ids", selectedValues);
  };

  if (isLoading || loadingDepartments) {
    return (
      <View style={globalStyles.secondaryContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (errorDepartments) {
    return (
      <View style={globalStyles.secondaryContainer}>
        <Text style={{ color: "red", textAlign: "center" }}>
          Failed to load departments. Please try again.
        </Text>
        <CustomButton
          title="Retry"
          onPress={() => {
            setLoadingDepartments(true);
            setErrorDepartments(null);
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
        onClose={() => setModal({ ...modal, visible: false })}
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
            onSelect={handleDepartmentChange}
            multiSelect
          />
          <View style={styles.buttonContainer}>
            <CustomButton title="SUBMIT" onPress={() => handleSubmit()} />
          </View>
        </View>
      </ScrollView>
      <TabsComponent />
      <StatusBar style="auto" />
    </View>
  );
};

export default AddEvent;

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
});
