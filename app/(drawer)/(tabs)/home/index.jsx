import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";

import globalStyles from "../../../..//constants/globalStyles";

const Home = () => {
  return (
    <View style={globalStyles.secondaryContainer}>
      <Text>Home</Text>
      <StatusBar style="auto" />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
