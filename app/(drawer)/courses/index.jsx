import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import TabsComponent from "../../../components/TabsComponent";

import globalStyles from "../../../constants/globalStyles";

const Courses = () => {
  return (
    <View style={globalStyles.secondaryContainer}>
      <Text>Courses</Text>
      <TabsComponent />
      <StatusBar style="auto" />
    </View>
  );
};

export default Courses;

const styles = StyleSheet.create({});
