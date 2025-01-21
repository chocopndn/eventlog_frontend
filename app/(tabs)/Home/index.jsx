import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import CollapsibleDropdown from "../../../components/CollapsibleDropdown";

const welcome = () => {};

const HomeIndex = () => {
  return (
    <SafeAreaView className="bg-secondary h-full">
      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View className="flex-1 items-center bg-secondary pt-[100px]">
          <Text className="font-SquadaOne color-primary text-[80px] mt-8">
            EVENTLOG
          </Text>
          <Text className="font-SquadaOne color-primary text-[35px] pt-5">
            ANNOUNCEMENT
          </Text>
          <View className="w-full items-center justify-center pb-8">
            <View className="w-[303px] h-1 bg-primary"></View>
          </View>
          <TouchableOpacity
            className="border-2 w-[303px] h-[52px] border-primary justify-center pl-3"
            onPress={() => router.push("/Home/Welcome")}
          >
            <Text className="font-SquadaOne color-primary text-[20px] text-center">
              WELCOME EVENTLOG USERS!
            </Text>
          </TouchableOpacity>

          <View className="w-[303px] mt-4 mb-10">
            <CollapsibleDropdown
              title="UCV@76th Foundation Week"
              date="September 23-28, 2024"
              venue="INFRONT OF CIT OFFICE - VHNP BUILDING"
              morningIn="6:30-7:30"
              afternoonIn="12:00-1:00"
              morningOut="11:00-12:00"
              afternoonOut="5:00-6:00"
              personnel="Year Level Representatives, Governor, or Year Level Advisers"
            />
          </View>
        </View>
        <StatusBar style="dark" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeIndex;
