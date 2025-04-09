import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import CryptoJS from "crypto-js";
import moment from "moment";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import CustomModal from "../../../../components/CustomModal";
import { QR_SECRET_KEY } from "../../../../config/config";
import { getStoredEvents } from "../../../../database/queries";

const Scan = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState("back");

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const logWithDateAndTime = (message) => {
    const currentDate = moment().format("YYYY-MM-DD");
    const currentTime = moment().format("HH:mm:ss");
    console.log(`date now: ${currentDate}`);
    console.log(`time now: ${currentTime}`);
    console.log(`Message: ${message}`);
  };

  useEffect(() => {
    if (permission?.status === "denied") {
      logWithDateAndTime("Camera permission denied. Requesting permission...");
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (permission === undefined) {
    logWithDateAndTime("Camera permissions are still loading...");
    return (
      <View style={globalStyles.secondaryContainer}>
        <Text style={styles.message}>Loading camera permissions...</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (permission?.status !== "granted") {
    logWithDateAndTime("Camera permission not granted by the user.");
    return (
      <View style={globalStyles.secondaryContainer}>
        <Text style={styles.message}>
          We need your permission to access the camera.
        </Text>
        <Text style={styles.subNote}>
          Go to Settings → Apps → Your App → Permissions → Camera and allow
          access.
        </Text>
        <StatusBar style="light" />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }) => {
    try {
      logWithDateAndTime("QR Code scanned. Starting validation process...");

      logWithDateAndTime("Checking if the scanned data is Base64 encoded...");
      if (!isBase64(data)) {
        throw new Error("Invalid QR Code format");
      }
      logWithDateAndTime("Data is valid Base64.");

      logWithDateAndTime("Decrypting the scanned data...");
      const bytes = CryptoJS.AES.decrypt(data, QR_SECRET_KEY);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      logWithDateAndTime(`Decrypted text: ${decryptedText}`);

      logWithDateAndTime("Validating decrypted text format...");
      if (!decryptedText || !decryptedText.startsWith("eventlog")) {
        throw new Error("Decrypted data is not EventLog-specific");
      }
      logWithDateAndTime("Decrypted text is EventLog-specific.");

      logWithDateAndTime("Parsing decrypted text into components...");
      const parts = decryptedText.split("-");
      if (parts.length !== 3 || parts[0] !== "eventlog") {
        throw new Error("Invalid EventLog format");
      }
      const eventDateId = parseInt(parts[1], 10);
      const studentId = parseInt(parts[2], 10);

      logWithDateAndTime(
        `Parsed event_date_id: ${eventDateId}, student_id_number: ${studentId}`
      );

      if (isNaN(eventDateId) || isNaN(studentId)) {
        throw new Error("Invalid event_date_id or student_id_number");
      }
      logWithDateAndTime("Parsed components are valid numbers.");

      logWithDateAndTime("Checking if event_date_id exists in the database...");
      const eventExists = await getStoredEvents(eventDateId);
      if (!eventExists) {
        throw new Error("Event date ID does not exist in the database");
      }
      logWithDateAndTime(
        "Event date ID verified successfully in the database."
      );

      logWithDateAndTime(
        "QR Code scanning successful. Showing success modal..."
      );
      setSuccessModalVisible(true);
    } catch (error) {
      logWithDateAndTime(`Error during QR Code scanning: ${error.message}`);
      setErrorModalVisible(true);
    }
  };

  const isBase64 = (str) => {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  };

  const isModalVisible = successModalVisible || errorModalVisible;

  return (
    <View style={globalStyles.secondaryContainer}>
      <Text style={styles.note}>Find a QR Code to scan</Text>
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={isModalVisible ? null : handleBarcodeScanned}
        />
      </View>

      <CustomModal
        visible={successModalVisible}
        title="QR Code Scanned"
        message="EventLog QR Code successfully scanned!"
        type="success"
        onClose={() => setSuccessModalVisible(false)}
        onCancel={() => setSuccessModalVisible(false)}
        confirmTitle="OK"
        onConfirm={() => setSuccessModalVisible(false)}
      />

      <CustomModal
        visible={errorModalVisible}
        title="Error"
        message="Please scan EventLog-specific QR Code only."
        type="error"
        onClose={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
        cancelTitle="CLOSE"
      />

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
