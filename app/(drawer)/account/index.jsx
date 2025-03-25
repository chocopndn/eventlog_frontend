import { StyleSheet, Text, View } from "react-native";
import React from "react";

import TabsComponent from "../../../components/TabsComponent";
import globalStyles from "../../../constants/globalStyles";

const AccountScreen = () => {
  return (
    <View style={globalStyles.secondaryContainer}>
      <Text style={styles.title}>Account</Text>

      <TabsComponent />
    </View>
  );
};

export default AccountScreen;

const styles = StyleSheet.create({});
