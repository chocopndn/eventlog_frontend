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
import TabsComponent from "../../../components/TabsComponent";
import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";
import FormField from "../../../components/FormField";
import CustomDropdown from "../../../components/CustomDropdown";
import CustomButton from "../../../components/CustomButton";
import { fetchDepartments, addCourse } from "../../../services/api";
import CustomModal from "../../../components/CustomModal";

const AddCourse = () => {
  const [formData, setFormData] = useState({
    course_name: "",
    department_id: null,
  });

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  useEffect(() => {
    const fetchDepartmentsData = async () => {
      setIsLoading(true);
      try {
        const departments = await fetchDepartments();
        setDepartmentOptions(departments);
      } catch (error) {
        setModal({
          visible: true,
          title: "Error",
          message: "Failed to load departments. Please try again.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentsData();
  }, []);

  const handleChange = (name, value) => {
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.course_name.trim() || formData.department_id === null) {
        setModal({
          visible: true,
          title: "Warning",
          message: "Please fill in all required fields.",
          type: "warning",
        });
        return;
      }

      const submitData = {
        course_name: formData.course_name,
        department_id: formData.department_id,
      };

      await addCourse(submitData);

      setModal({
        visible: true,
        title: "Success",
        message: "Course added successfully!",
        type: "success",
      });
      setFormData({
        course_name: "",
        department_id: null,
      });
    } catch (error) {
      setModal({
        visible: true,
        title: "Error",
        message:
          error.response?.data?.message ||
          "Failed to add course. Please try again.",
        type: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.secondaryContainer, { paddingTop: 0 }]}>
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
        <Text style={styles.textTitle}>ADD COURSE</Text>
      </View>
      <ScrollView
        style={styles.scrollviewContainer}
        contentContainerStyle={styles.scrollview}
        showsVerticalScrollIndicator={false}
      >
        <FormField
          title="Course Name"
          placeholder="Enter course name"
          value={formData.course_name}
          onChangeText={(text) => handleChange("course_name", text)}
        />

        <CustomDropdown
          title="Department"
          data={departmentOptions}
          placeholder="Select a department"
          value={formData.department_id}
          onSelect={(item) => handleChange("department_id", item.value)}
        />

        <CustomButton title="ADD" onPress={handleSubmit} />
      </ScrollView>

      <TabsComponent />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default AddCourse;

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
});
