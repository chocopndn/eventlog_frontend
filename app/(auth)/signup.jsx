import React, { useState, useEffect } from "react";
import { View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

import FormField2 from "../../components/FormField2";
import CustomButton from "../../components/CustomButton";
import CustomDropdown from "../../components/CustomDropdown";
import { StatusBar } from "expo-status-bar";

const SignUp = () => {
  const [idNumber, setIdNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [surname, setSurname] = useState("");
  const [suffix, setSuffix] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dropdownValue, setDropdownValue] = useState(null);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          "http://192.168.1.239:3000/api/departments"
        );
        const formattedData = response.data.departments.map((dept, index) => ({
          label: dept,
          value: `department_${index}`,
        }));
        setDepartments(formattedData);
      } catch (error) {
        console.error("Error fetching departments:", error.message);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="items-center justify-center">
          <FormField2
            title="ID Number"
            value={idNumber}
            onChangeText={(text) => setIdNumber(text)}
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
            title="Surname"
            sample="Garcia"
            value={surname}
            onChangeText={setSurname}
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

          <CustomDropdown
            title="Department"
            data={departments}
            onSelect={(value) => setDropdownValue(value)}
            placeholder="Select Department"
          />

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

          <View className="mt-4">
            <CustomButton title="Sign Up" />
          </View>
        </View>
      </ScrollView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default SignUp;
