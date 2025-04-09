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

  useEffect(() => {
    if (permission?.status === "denied") {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (permission === undefined) {
    return (
      <View style={globalStyles.secondaryContainer}>
        <Text style={styles.message}>Loading camera permissions...</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (permission?.status !== "granted") {
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
      const fullDateTime = moment().format("YYYY-MM-DD HH:mm:ss");
      console.log(`[attendance] Full date and time: ${fullDateTime}`);

      if (!isBase64(data)) {
        throw new Error("Invalid QR Code format");
      }

      const bytes = CryptoJS.AES.decrypt(data, QR_SECRET_KEY);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedText || !decryptedText.startsWith("eventlog")) {
        throw new Error("Decrypted data is not EventLog-specific");
      }

      const parts = decryptedText.split("-");
      if (parts.length !== 3 || parts[0] !== "eventlog") {
        throw new Error("Invalid EventLog format");
      }
      const eventDateId = parseInt(parts[1], 10);
      const studentId = parseInt(parts[2], 10);

      if (isNaN(eventDateId) || isNaN(studentId)) {
        throw new Error("Invalid event_date_id or student_id_number");
      }

      console.log(
        `[attendance] Fetching event data for event_date_id: ${eventDateId}`
      );
      const events = await getStoredEvents(eventDateId);

      if (!Array.isArray(events) || events.length === 0) {
        throw new Error("No events found for the given event_date_id");
      }

      const event = events.find((e) => e.event_date_ids.includes(eventDateId));

      if (!event) {
        throw new Error("Event not found for the given event_date_id");
      }

      console.log(`[attendance] Retrieved event data:`, event);

      const { am_in, am_out, pm_in, pm_out } = event;

      if ((!am_in || !am_out) && (!pm_in || !pm_out)) {
        throw new Error(
          "Attendance slots are missing or undefined in the database"
        );
      }

      const currentDate = moment().format("YYYY-MM-DD");
      const currentTime = moment().format("HH:mm:ss");

      console.log(`[attendance] Date now: ${currentDate}`);
      console.log(`[attendance] Time now: ${currentTime}`);
      console.log(`[attendance] Expected AM_IN: ${am_in}, AM_OUT: ${am_out}`);
      console.log(`[attendance] Expected PM_IN: ${pm_in}, PM_OUT: ${pm_out}`);

      let isValidTime = false;

      if (am_in && am_out) {
        isValidTime =
          moment(currentTime, "HH:mm:ss").isBetween(
            moment(am_in, "HH:mm:ss"),
            moment(am_out, "HH:mm:ss")
          ) || isValidTime;
      }

      if (pm_in && pm_out) {
        isValidTime =
          moment(currentTime, "HH:mm:ss").isBetween(
            moment(pm_in, "HH:mm:ss"),
            moment(pm_out, "HH:mm:ss")
          ) || isValidTime;
      }

      if (isValidTime) {
        console.log(
          `[attendance] Student ID: ${studentId} is within valid attendance slots.`
        );
      } else {
        console.log("[attendance] Outside valid attendance slots.");
      }

      setSuccessModalVisible(true);
    } catch (error) {
      console.error(
        `[attendance] Error during QR Code scanning: ${error.message}`
      );
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
