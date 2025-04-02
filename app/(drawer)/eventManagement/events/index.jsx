import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import CustomButton from "../../../../components/CustomButton";
import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

export default function EventsScreen() {
  return (
    <SafeAreaView style={[globalStyles.secondaryContainer, { paddingTop: 0 }]}>
      <View style={styles.buttonWrapper}>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Events"
            onPress={() => router.push("/events/EventsList")}
          />
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Event Names"
            onPress={() => router.push("/events/EventNames")}
            type="secondary"
          />
        </View>
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: theme.spacing.medium,
  },
  buttonContainer: {
    width: "80%",
    marginVertical: theme.spacing.small,
  },
});
