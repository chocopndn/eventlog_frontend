import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";

import images from "../../../constants/images";
import SharpDropdown from "../../../components/SharpDropdown2";
import FormField from "../../../components/FormField3";
import { API_URL } from "../../../config/config";

const AddEvent = () => {
  const [eventName, setEventName] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/departments`);
        if (
          response.status === 200 &&
          Array.isArray(response.data.departments)
        ) {
          const departmentData = response.data.departments.map((dept) => ({
            label: dept.name,
            value: dept.id,
          }));
          setDepartments(departmentData);
        } else {
          console.error("Invalid API response:", response);
          setDepartments([{ label: "Error Loading Departments", value: null }]);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartments([{ label: "Error Loading Departments", value: null }]);
      }
    };

    fetchDepartments();
  }, []);

  const handleDepartmentSelect = (values) => {
    setSelectedDepartments(values);
  };

  return (
    <SafeAreaView className="bg-secondary h-full">
      <View className="flex-1 items-center bg-secondary pb-5">
        <Text className="font-SquadaOne color-primary text-[80px] pt-10">
          EVENTLOG
        </Text>
        <Text className="font-SquadaOne color-primary text-[35px] pt-5">
          ANNOUNCEMENT
        </Text>
        <View className="w-full items-center justify-center pb-8">
          <View className="w-[300px] h-1 bg-primary"></View>
        </View>

        <View className="w-[300px] h-[450px] border-2 border-primary">
          <View className="w-[300px] h-[50px] border-b-2 border-primary items-center justify-center flex-row">
            <Text className="font-SquadaOne text-primary text-[25px]">
              ADD EVENT
            </Text>
            <TouchableOpacity className="absolute right-4 h-[30px] w-[30px] bg-primary rounded-full items-center justify-center">
              <Image
                source={images.xlogo}
                className="h-[24px] w-[24px]"
                style={{ tintColor: "#FBF1E5" }}
              />
            </TouchableOpacity>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            className="p-4"
          >
            <View>
              <Text className="font-Arial text-primary">Departments</Text>
              <SharpDropdown
                data={departments}
                onSelect={handleDepartmentSelect}
                placeholder="Select Departments"
                value={selectedDepartments}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddEvent;
