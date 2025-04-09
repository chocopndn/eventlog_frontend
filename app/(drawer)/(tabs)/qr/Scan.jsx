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
import { getStoredEvents, logAttendance } from "../../../../database/queries";

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

      const { am_in, am_out, pm_in, pm_out, duration } = event;

      const calculateWindow = (time) => {
        return time
          ? moment(time, "HH:mm:ss").add(duration, "minutes").format("HH:mm:ss")
          : null;
      };

      const amInWindowEnd = calculateWindow(am_in);
      const amOutWindowEnd = calculateWindow(am_out);
      const pmInWindowEnd = calculateWindow(pm_in);
      const pmOutWindowEnd = calculateWindow(pm_out);

      const currentDate = moment().format("YYYY-MM-DD");
      const currentTime = moment().format("HH:mm:ss");

      console.log(`[attendance] Date now: ${currentDate}`);
      console.log(`[attendance] Time now: ${currentTime}`);
      console.log(`[attendance] AM_IN Window: ${am_in} - ${amInWindowEnd}`);
      console.log(`[attendance] AM_OUT Window: ${am_out} - ${amOutWindowEnd}`);
      console.log(`[attendance] PM_IN Window: ${pm_in} - ${pmInWindowEnd}`);
      console.log(`[attendance] PM_OUT Window: ${pm_out} - ${pmOutWindowEnd}`);

      let isValidTime = false;
      let attendanceType = null;

      if (am_in && amInWindowEnd) {
        if (
          moment(currentTime, "HH:mm:ss").isBetween(
            moment(am_in, "HH:mm:ss"),
            moment(amInWindowEnd, "HH:mm:ss")
          )
        ) {
          isValidTime = true;
          attendanceType = "AM_IN";
        }
      }

      if (am_out && amOutWindowEnd) {
        if (
          moment(currentTime, "HH:mm:ss").isBetween(
            moment(am_out, "HH:mm:ss"),
            moment(amOutWindowEnd, "HH:mm:ss")
          )
        ) {
          isValidTime = true;
          attendanceType = "AM_OUT";
        }
      }

      if (pm_in && pmInWindowEnd) {
        if (
          moment(currentTime, "HH:mm:ss").isBetween(
            moment(pm_in, "HH:mm:ss"),
            moment(pmInWindowEnd, "HH:mm:ss")
          )
        ) {
          isValidTime = true;
          attendanceType = "PM_IN";
        }
      }

      if (pm_out && pmOutWindowEnd) {
        if (
          moment(currentTime, "HH:mm:ss").isBetween(
            moment(pm_out, "HH:mm:ss"),
            moment(pmOutWindowEnd, "HH:mm:ss")
          )
        ) {
          isValidTime = true;
          attendanceType = "PM_OUT";
        }
      }

      if (isValidTime) {
        console.log(
          `[attendance] Student ID: ${studentId} is within valid attendance slots. Type: ${attendanceType}`
        );

        const attendanceData = {
          event_date_id: eventDateId,
          student_id_number: studentId,
          type: attendanceType,
        };

        console.log(`[attendance] Attendance data to log:`, attendanceData);

        await logAttendance(attendanceData);

        setSuccessModalVisible(true);
      } else {
        console.log("[attendance] Outside valid attendance slots.");
      }
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
