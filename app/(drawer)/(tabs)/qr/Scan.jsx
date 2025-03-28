import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

const Scan = () => {
  return (
    <SafeAreaView style={globalStyles.secondaryContainer}>
      <Text>Scan</Text>

      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default Scan;

const styles = StyleSheet.create({});
