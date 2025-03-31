import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import TabsComponent from "../../../components/TabsComponent";
import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";
import FormField from "../../../components/FormField";
import CustomDropdown from "../../../components/CustomDropdown";
import CustomButton from "../../../components/CustomButton";
import { fetchBlocks, fetchUserById, updateUser } from "../../../services/api";
import CustomModal from "../../../components/CustomModal";
import { useLocalSearchParams } from "expo-router";

const EditStudent = () => {
  const { id: id_number } = useLocalSearchParams();
  const [formData, setFormData] = useState({
    id_number: "",
    role_id: null,
    block_id: null,
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    email: "",
  });

  const [blocks, setBlocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal] = useState({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const roles = [
    { label: "Student", value: "1" },
    { label: "Officer", value: "2" },
  ];

  const [statusOptions, setStatusOptions] = useState([
    { label: "Active", value: "active" },
    { label: "Disabled", value: "disabled" },
  ]);

  useEffect(() => {
    if (formData.status === "unregistered") {
      setStatusOptions((prev) => [
        ...prev,
        { label: "Unregistered", value: "unregistered" },
      ]);
    }
  }, [formData.status]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!id_number) {
          throw new Error("Invalid student ID");
        }

        const blocksData = await fetchBlocks();
        setBlocks(
          blocksData.map((block) => ({
            label: block.name || `Block ${block.id}`,
            value: block.id,
          }))
        );

        const studentDetails = await fetchUserById(id_number);

        if (!studentDetails) {
          throw new Error("Student details not found");
        }

        setFormData({
          id_number: studentDetails.id_number || "",
          role_id: String(studentDetails.role_id) || null,
          block_id: String(studentDetails.block_id) || null,
          first_name: studentDetails.first_name || "",
          middle_name: studentDetails.middle_name || "",
          last_name: studentDetails.last_name || "",
          suffix: studentDetails.suffix || "",
          email: studentDetails.email || "",
          status: studentDetails.status || "",
        });
      } catch (error) {
        setModal({
          visible: true,
          title: "Error",
          message: error.message || "Failed to load student details.",
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id_number]);

  const handleChange = (name, value) => {
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (
        !formData.id_number.trim() ||
        !formData.role_id ||
        !formData.block_id ||
        !formData.first_name.trim() ||
        !formData.last_name.trim()
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
        role_id: parseInt(formData.role_id, 10),
        block_id: parseInt(formData.block_id, 10),
        first_name: formData.first_name,
        middle_name: formData.middle_name || null,
        last_name: formData.last_name,
        suffix: formData.suffix || null,
        email: formData.status === "unregistered" ? null : formData.email,
        status: formData.status,
      };

      await updateUser(id_number, submitData);

      setModal({
        visible: true,
        title: "Success",
        message: "Student updated successfully!",
        type: "success",
      });
    } catch (error) {
      setModal({
        visible: true,
        title: "Error",
        message: error.response?.data?.message || "Failed to update student.",
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

      <Text style={styles.textHeader}>EDIT STUDENT</Text>
      <View style={styles.titleContainer}>
        <Text style={styles.textTitle}>EDIT STUDENT DETAILS</Text>
      </View>

      <ScrollView
        style={styles.scrollviewContainer}
        contentContainerStyle={styles.scrollview}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <FormField
            title="ID Number"
            placeholder="12345678"
            value={formData.id_number}
            onChangeText={(text) => handleChange("id_number", text)}
          />

          <CustomDropdown
            title="Role"
            data={roles}
            placeholder="Select a role"
            value={formData.role_id}
            onSelect={(item) => handleChange("role_id", item.value)}
          />

          <CustomDropdown
            title="Block"
            data={blocks}
            placeholder="Select a block"
            value={formData.block_id}
            onSelect={(item) => handleChange("block_id", item.value)}
          />

          <FormField
            title="First Name"
            placeholder="Juan Miguel"
            value={formData.first_name}
            onChangeText={(text) => handleChange("first_name", text)}
          />

          <FormField
            title="Middle Name (Optional)"
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
            title="Suffix (Optional)"
            placeholder="Jr"
            value={formData.suffix}
            onChangeText={(text) => handleChange("suffix", text)}
          />

          <FormField
            title="Email"
            placeholder="example@gmail.com"
            value={formData.email}
            onChangeText={(text) => handleChange("email", text)}
          />
          <CustomDropdown
            title="Status"
            data={statusOptions}
            value={formData.status || formData.status}
            onSelect={(item) => handleChange("status", item.value)}
          />
        </View>

        <View>
          <CustomButton title="UPDATE" onPress={handleSubmit} />
        </View>
      </ScrollView>

      <TabsComponent />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default EditStudent;

const styles = StyleSheet.create({
  textHeader: {
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.display,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
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
    justifyContent: "space-between",
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
