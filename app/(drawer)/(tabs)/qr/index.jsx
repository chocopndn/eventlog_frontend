import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

import CustomButton from "../../../../components/CustomButton";

const QRCode = () => {
  return (
    <SafeAreaView style={globalStyles.secondaryContainer}>
      <View style={styles.buttonWrapper}>
        <View>
          <CustomButton
            onPress={() => {
              router.push("/qr/Generate");
            }}
            title="Generate"
          />
        </View>
        <View style={styles.scanContainer}>
          <CustomButton
            onPress={() => {
              router.push("/qr/Scan");
            }}
            title="Scan"
            type="secondary"
          />
        </View>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default QRCode;

const styles = StyleSheet.create({
  buttonWrapper: {
    width: "70%",
  },
  scanContainer: {
    marginTop: theme.spacing.medium,
  },
});
