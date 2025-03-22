import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { API_URL } from "../../../config/config";
import { useRouter } from "expo-router";

import theme from "../../../constants/theme";
import globalStyles from "../../../constants/globalStyles";

import Header from "../../../components/Header";
import FormField from "../../../components/FormField";
import CustomDropdown from "../../../components/CustomDropdown";
import CustomButton from "../../../components/CustomButton";
import CustomModal from "../../../components/CustomModal";

const SignUp = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_number: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix: "",
    email: "",
    password: "",
    confirm_password: "",
    department_id: null,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("error");

  const router = useRouter();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/departments`);
      if (response.data?.departments) {
        setDepartments(
          response.data.departments.map((dept) => ({
            label: dept.department_name,
            value: dept.department_id,
          }))
        );
      } else {
        showModal("Invalid API response.", "warning");
      }
    } catch (error) {
      showModal("Failed to load departments. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (message, type) => {
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (
      !formData.id_number ||
      !formData.first_name ||
      !formData.last_name ||
      !formData.email ||
      !formData.password ||
      !formData.confirm_password ||
      !formData.department_id
    ) {
      showModal("Please fill in all required fields.", "warning");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      showModal("Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, {
        id_number: formData.id_number,
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        suffix: formData.suffix || null,
        email: formData.email,
        password: formData.password,
        department_id: formData.department_id,
      });

      if (response.data.success) {
        showModal("Registration successful!", "success");

        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        showModal(response.data.message || "Registration failed.", "error");
      }
    } catch (error) {
      showModal(
        error.response?.data?.message || "Something went wrong.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.primaryContainer}>
      <View style={styles.headerContainer}>
        <Header type="primary" />
        <Text style={styles.headerText}>REGISTER</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollview}
        showsVerticalScrollIndicator={false}
      >
        <FormField
          type="id"
          iconShow={false}
          title="ID Number"
          placeholder="12345"
          onChangeText={(value) => handleInputChange("id_number", value)}
        />
        <FormField
          title="First Name"
          placeholder="Juan Miguel"
          onChangeText={(value) => handleInputChange("first_name", value)}
        />
        <FormField
          title="Middle Name"
          placeholder="Reyes"
          onChangeText={(value) => handleInputChange("middle_name", value)}
        />
        <FormField
          title="Last Name"
          placeholder="Santos"
          onChangeText={(value) => handleInputChange("last_name", value)}
        />
        <FormField
          title="Suffix Name"
          placeholder="Jr"
          optional
          onChangeText={(value) => handleInputChange("suffix", value)}
        />
        <FormField
          type="email"
          iconShow={false}
          title="Email"
          placeholder="example@email.com"
          onChangeText={(value) => handleInputChange("email", value)}
        />

        {loading ? (
          <Text>Loading Departments...</Text>
        ) : (
          <CustomDropdown
            placeholder="Select Department"
            title="Department"
            data={departments}
            onSelect={(value) => handleInputChange("department_id", value)}
          />
        )}

        <FormField
          type="password"
          iconShow={false}
          title="Password"
          placeholder="Enter your password"
          secureTextEntry
          onChangeText={(value) => handleInputChange("password", value)}
        />
        <FormField
          type="password"
          iconShow={false}
          title="Confirm Password"
          placeholder="Confirm your password"
          secureTextEntry
          onChangeText={(value) => handleInputChange("confirm_password", value)}
        />
        <View style={styles.agreementContainer}>
          <Text style={styles.agreement}>
            * By registering for EVENTLOG, you agree to the terms and conditions
            set by the College of Information Technology Department. Your
            participation and continued use of EVENTLOG confirm your acceptance
            of these policies.
          </Text>
          <Text style={styles.agreement}>
            *Warning: Please use only one account.
          </Text>
        </View>

        <CustomButton
          type="secondary"
          title="REGISTER"
          onPress={handleRegister}
          disabled={loading}
        />

        <View style={styles.accountPromptContainer}>
          <Text style={styles.prompt}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => {
              router.push("/login");
            }}
          >
            <Text style={styles.loginText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomModal
        visible={modalVisible}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalVisible(false)}
      />

      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 75,
  },
  headerText: {
    fontFamily: "SquadaOne",
    fontSize: theme.fontSizes.display,
    color: theme.colors.secondary,
  },
  scrollview: {
    justifyContent: "center",
    width: "100%",
  },
  agreementContainer: {
    width: "80%",
    marginBottom: theme.spacing.medium,
  },
  agreement: {
    fontFamily: "Arial",
    color: theme.colors.secondary,
    fontSize: theme.fontSizes.extraSmall,
    textAlign: "center",
  },
  accountPromptContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  prompt: {
    fontFamily: "Arial",
    color: theme.colors.secondary,
    fontSize: theme.fontSizes.small,
  },
  loginText: {
    fontFamily: "ArialBold",
    color: theme.colors.secondary,
    fontSize: theme.fontSizes.small,
  },
});
