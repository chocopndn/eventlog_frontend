import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import CustomButton from "../../../../components/CustomButton";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

const Scan = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState("back");

  useEffect(() => {
    if (permission?.status === "denied") {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (permission?.status === null) {
    return (
      <View style={globalStyles.secondaryContainer}>
        <Text style={styles.message}>
          Please enable camera access to scan QR codes and track attendance.
        </Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (permission?.status === "denied") {
    return (
      <View style={globalStyles.secondaryContainer}>
        <View style={styles.messageContainer}>
          <Text style={styles.message}>
            We need your permission to access the camera.
          </Text>
          <Text style={styles.subNote}>
            Go to Settings {`>`} Apps {`>`} EventLog {`>`} Permissions {`>`}{" "}
            Camera and allow access.
          </Text>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={globalStyles.secondaryContainer}>
      <CameraView style={styles.camera} type={facing} />
      <StatusBar style="light" />
    </View>
  );
};

export default Scan;

const styles = StyleSheet.create({
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  message: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.large,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fontFamily.Arial,
  },
  subNote: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    textAlign: "center",
    marginTop: theme.spacing.small,
    fontFamily: theme.fontFamily.Arial,
  },
  camera: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 30,
    overflow: "hidden",
  },
  buttonContainer: {
    width: "80%",
  },
});
