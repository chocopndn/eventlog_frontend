import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";

import globalStyles from "../../../../constants/globalStyles";

const Generate = () => {
  return (
    <SafeAreaView style={globalStyles.secondaryContainer}>
      <Text>Generate</Text>

      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default Generate;

const styles = StyleSheet.create({});
