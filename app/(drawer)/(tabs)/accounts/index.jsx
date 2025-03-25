import { StyleSheet, Text, View } from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import CustomButton from "../../../../components/CustomButton";
import globalStyles from "../../../../constants/globalStyles";

const Account = () => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("id_number");
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View style={globalStyles.secondaryContainer}>
      <Text style={styles.title}>Account</Text>

      <CustomButton
        type="secondary"
        title="Logout"
        onPress={handleLogout}
        otherStyles={styles.logoutButton}
      />
    </View>
  );
};

export default Account;

const styles = StyleSheet.create({});
