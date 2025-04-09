import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";

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
      <Text style={styles.note}>Find a QR Code to scan</Text>
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} type={facing} />
      </View>
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
    width: "100%",
    height: "100%",
    borderRadius: 35,
  },
  cameraContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 10,
    borderColor: theme.colors.primary,
    borderRadius: 50,
    width: "80%",
    height: "45%",
    overflow: "hidden",
  },
  note: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.huge,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fontFamily.SquadaOne,
  },
});
