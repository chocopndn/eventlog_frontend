import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import axios from "axios";

import FormField2 from "../../components/FormField2";
import CustomButton from "../../components/CustomButton";
import CustomDropdown from "../../components/CustomDropdown";
import ErrorModal from "../../components/ErrorModal";
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
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigateToLogin = () => {
    router.push("./LogIn");
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          `http://${config.API_URL}/api/departments`
        );

        if (response.data && Array.isArray(response.data.departments)) {
          const formattedData = response.data.departments.map((dept) => ({
            label: dept.departmentName,
            value: dept.department_ID,
          }));
          setDepartments(formattedData);
        } else {
          throw new Error("Invalid department data format");
        }
      } catch (error) {
        setErrorMessage("Failed to fetch departments. Please try again later.");
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

    const payload = {
      student_ID,
      firstName,
      middleName,
      lastName,
      suffix: suffix || null,
      email,
      password,
      department,
    };

    try {
      const response = await axios.post(
        `http://${config.API_URL}/api/auth/signup`,
        payload
      );

      if (response.status === 200) {
        router.push("./LogIn");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Something went wrong during sign-up."
      );
      setErrorVisible(true);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full h-50 items-center justify-center mt-5">
          <View className="absolute w-full h-28 bg-secondary"></View>
          <View className="absolute w-[70%] h-10 bg-cyan-500 top-1/3 right-52"></View>
          <View className="absolute w-[70%] h-10 bg-cyan-500 bottom-1/3 left-52"></View>
          <View className="absolute w-[70%] h-10 bg-primary"></View>
          <View className="mt-5 mb-7">
            <Image source={images.logo} className="w-[196px] h-[196px]" />
          </View>
        </View>

        <Text className="font-SquadaOne text-7xl text-secondary mb-5 text-center">
          REGISTER
        </Text>
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
              onSelect={(value) => setDepartment(value)}
              placeholder="Select Department"
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

          <View className="w-[311px] pt-4">
            <Text className="text-[12px] font-ArialItalic text-center color-secondary">
              *By registering for EVENTLOG, you agree with all the terms and
              conditions set by the College of Information Technology
              Department. Your participation and continued use of EVENTLOG
              confirm your acceptance of these policies. *Warning: Make sure to
              use one account only.
            </Text>
          </View>

          <CustomButton
            title="Sign Up"
            type="secondary"
            otherStyles="mt-6 mb-2"
            onPress={handleSignUp}
          />
        </View>
        <View className="flex-row mt-5 justify-center mb-20">
          <Text className="font-Arial text-white text-[12px]">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={navigateToLogin}>
            <Text className="font-Arial font-bold text-white text-[12px]">
              Log In.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ErrorModal
        visible={errorVisible}
        onClose={() => setErrorVisible(false)}
        title="Error"
        message={errorMessage}
      />
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default SignUp;
