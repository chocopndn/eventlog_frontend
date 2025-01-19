import React, { useState, useEffect } from "react";
import { View, ScrollView, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import axios from "axios";

import FormField2 from "../../components/FormField2";
import CustomButton from "../../components/CustomButton";
import CustomDropdown from "../../components/CustomDropdown";
import images from "../../constants/images";

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

  const signin = () => {
    router.push("./LogIn");
  };

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
          />
        </View>
        <View className="flex-row mt-5 justify-center mb-20">
          <Text className="font-Arial text-white text-[12px]">
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={signin}>
            <Text className="font-Arial font-bold text-white text-[12px]">
              Log In.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default SignUp;
