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
import { fetchDepartments, addAdmin } from "../../../services/api";
import CustomModal from "../../../components/CustomModal";

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    id_number: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    email: "",
    department_id: null,
    role_id: null,
  });

  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const roleOptions = [
    { label: "Admin", value: 3 },
    { label: "Super Admin", value: 4 },
  ];

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
      if (
        !formData.id_number ||
        !formData.first_name ||
        !formData.last_name ||
        !formData.email.trim() ||
        formData.department_id === null ||
        formData.role_id === null
      ) {
        setModal({
          visible: true,
          title: "Warning",
          message: "Please fill in all required fields.",
          type: "warning",
        });
        return;
      }

      const submitData = {
        id_number: formData.id_number,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        suffix: formData.suffix,
        email: formData.email,
        department_id: formData.department_id,
        role_id: formData.role_id,
      };

      await addAdmin(submitData);
      setModal({
        visible: true,
        title: "Success",
        message: "Admin added successfully!",
        type: "success",
      });
      setFormData({
        id_number: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        email: "",
        department_id: null,
        role_id: null,
      });
    } catch (error) {
      setModal({
        visible: true,
        title: "Error",
        message:
          error.response?.data?.message ||
          "Failed to add admin. Please try again.",
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
        <Text style={styles.textTitle}>ADD ADMIN</Text>
      </View>
      <ScrollView
        style={styles.scrollviewContainer}
        contentContainerStyle={styles.scrollview}
        showsVerticalScrollIndicator={false}
      >
        <FormField
          type="id"
          iconShow={false}
          title="ID Number"
          placeholder="12345678"
          value={formData.id_number}
          onChangeText={(text) => handleChange("id_number", text)}
        />
        <FormField
          title="First Name"
          placeholder="Juan Miguel"
          value={formData.first_name}
          onChangeText={(text) => handleChange("first_name", text)}
        />
        <FormField
          title="Middle Name"
          placeholder="Reyes"
          value={formData.middle_name}
          onChangeText={(text) => handleChange("middle_name", text)}
        />
        <FormField
          title="Last Name"
          placeholder="Santos"
          value={formData.last_name}
          onChangeText={(text) => handleChange("last_name", text)}
        />
        <FormField
          title="Suffix"
          placeholder="Jr"
          value={formData.suffix}
          onChangeText={(text) => handleChange("suffix", text)}
        />
        <FormField
          type="email"
          iconShow={false}
          title="Email"
          placeholder="example@gmail.com"
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
        />

        <CustomDropdown
          title="Department"
          data={departmentOptions}
          placeholder="Select a department"
          value={formData.department_id}
          onSelect={(item) => handleChange("department_id", item.value)}
        />
        <CustomDropdown
          title="Role"
          data={roleOptions}
          placeholder="Select a role"
          value={formData.role_id}
          onSelect={(item) => handleChange("role_id", item.value)}
        />

        <CustomButton title="ADD" onPress={handleSubmit} />
      </ScrollView>

      <TabsComponent />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default AddAdmin;

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
