import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import axios from "axios";

import FormField2 from "../../components/FormField2";
import CustomButton from "../../components/CustomButton";
import CustomDropdown from "../../components/CustomDropdown";
import CustomModal from "../../components/CustomModal";
import images from "../../constants/images";
import config from "../../config/config";

const SignUp = () => {
  const [student_ID, setStudentID] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [errorVisible, setErrorVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      setIsLoading(true);
      try {
        const response = await axios.get(`${config.API_URL}/api/departments`);

        if (response.data?.departments?.length > 0) {
          setDepartments((prev) =>
            prev.length === 0
              ? response.data.departments.map((dept) => ({
                  label: dept.department_name,
                  value: dept.department_id,
                }))
              : prev
          );
        } else {
          setErrorMessage("No departments found.");
          setErrorVisible(true);
        }
      } catch (error) {
        setErrorMessage("Failed to load departments. Please try again later.");
        setErrorVisible(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleSignUp = async () => {
    if (!student_ID || !firstName || !lastName || !email || !password) {
      setErrorMessage("All required fields must be filled.");
      setErrorVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setErrorVisible(true);
      return;
    }

    if (!department) {
      setErrorMessage("Please select a department.");
      setErrorVisible(true);
      return;
    }

    const signUpData = {
      id_number: student_ID,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      suffix: suffix?.trim() ? suffix : null,
      email,
      password,
      department_id: department,
    };

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${config.API_URL}/api/auth/signup`,
        signUpData
      );

      if (response.status === 200) {
        setSuccessVisible(true);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Something went wrong during sign-up.";
      setErrorMessage(message);
      setErrorVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessVisible(false);
    router.replace("/login");
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="items-center justify-center">
          <FormField2
            title="ID Number"
            value={student_ID}
            onChangeText={setStudentID}
          />
          <FormField2
            title="First Name"
            sample="Juan Pedro"
            value={firstName}
            onChangeText={setFirstName}
          />
          <FormField2
            title="Middle Name"
            sample="Dela Cruz"
            value={middleName}
            onChangeText={setMiddleName}
          />
          <FormField2
            title="Last Name"
            sample="Garcia"
            value={lastName}
            onChangeText={setLastName}
          />
          <FormField2
            title="Suffix"
            sample="Jr"
            value={suffix}
            onChangeText={setSuffix}
          />
          <FormField2
            title="Email Address"
            value={email}
            onChangeText={setEmail}
          />

          {isLoading ? (
            <Text className="text-center text-gray-600 my-3">
              Loading departments...
            </Text>
          ) : (
            <CustomDropdown
              title="Department"
              data={departments}
              value={department}
              placeholder="Select Department"
              onSelect={(value) => {
                if (!departments.find((dept) => dept.value === value)) {
                  return false;
                }
                setDepartment(value);
                return true;
              }}
            />
          )}

          <FormField2
            title="Password"
            type="password"
            value={password}
            onChangeText={setPassword}
          />
          <FormField2
            title="Confirm Password"
            type="password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <CustomButton
            title="Sign Up"
            type="secondary"
            otherStyles="mt-6 mb-2"
            onPress={handleSignUp}
            disabled={isSubmitting}
          />
        </View>

        <CustomModal
          visible={successVisible}
          onClose={handleSuccessClose}
          title="Success"
          message="Your account has been successfully created! You can now log in."
        />
        <CustomModal
          visible={errorVisible}
          onClose={() => setErrorVisible(false)}
          title="Error"
          message={errorMessage}
        />

        <StatusBar style="light" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
