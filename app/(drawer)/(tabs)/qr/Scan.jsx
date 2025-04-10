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
import {
  getStoredEvents,
  logAttendance,
  isAlreadyLogged,
} from "../../../../database/queries";

const Scan = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [pendingAttendanceData, setPendingAttendanceData] = useState(null);

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
      if (!isBase64(data)) {
        throw new Error("Invalid QR Code format.");
      }

      const bytes = CryptoJS.AES.decrypt(data, QR_SECRET_KEY);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedText.startsWith("eventlog")) {
        throw new Error("Decrypted data is not EventLog-specific.");
      }

      const [prefix, eventDateIdStr, studentIdStr] = decryptedText.split("-");
      if (prefix !== "eventlog") {
        throw new Error("Decrypted data does not match expected format.");
      }

      const eventDateId = parseInt(eventDateIdStr, 10);
      const studentId = parseInt(studentIdStr, 10);

      if (isNaN(eventDateId) || isNaN(studentId)) {
        throw new Error("Invalid eventDateId or studentId.");
      }

      const events = await getStoredEvents(eventDateId);

      if (!Array.isArray(events) || events.length === 0) {
        throw new Error("No events found for the given date.");
      }

      const event = events.find((e) => e.event_date_ids.includes(eventDateId));

      if (!event) {
        throw new Error("Event not found for the given date.");
      }

      const { am_in, am_out, pm_in, pm_out, duration, event_name } = event;

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
        const attendanceData = {
          event_date_id: eventDateId,
          student_id_number: studentId,
          type: attendanceType,
          event_name: event_name,
        };

        const typeDescriptions = {
          AM_IN: "Morning Time In",
          AM_OUT: "Morning Time Out",
          PM_IN: "Afternoon Time In",
          PM_OUT: "Afternoon Time Out",
        };

        const friendlyTypeDescription = typeDescriptions[attendanceData.type];

        const alreadyLogged = await isAlreadyLogged(
          attendanceData.event_date_id,
          attendanceData.student_id_number,
          attendanceData.type
        );

        if (alreadyLogged) {
          setErrorMessage(
            `Attendance for ${friendlyTypeDescription} has already been logged.`
          );
          setErrorModalVisible(true);
          return;
        }

        setPendingAttendanceData(attendanceData);
        setConfirmationModalVisible(true);
      } else {
        setErrorMessage("Outside valid attendance slots.");
        setErrorModalVisible(true);
      }
    } catch (error) {
      setErrorMessage("Please scan eventlog-specific QR Code.");
      setErrorModalVisible(true);
    }
  };

  const confirmAttendance = async () => {
    try {
      await logAttendance(pendingAttendanceData);
      setSuccessModalVisible(true);
    } catch (error) {
      if (error.message.includes("has already been logged")) {
        setErrorMessage(error.message);
        setErrorModalVisible(true);
      } else {
        setErrorModalVisible(true);
      }
    } finally {
      setConfirmationModalVisible(false);
      setPendingAttendanceData(null);
    }
  };

  const cancelAttendance = () => {
    setConfirmationModalVisible(false);
    setPendingAttendanceData(null);
  };

  const isBase64 = (str) => {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  };

  const isModalVisible =
    successModalVisible || errorModalVisible || confirmationModalVisible;

  return (
    <View style={globalStyles.secondaryContainer}>
      <Text style={styles.note}>Find a QR Code to scan</Text>
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={isModalVisible ? null : handleBarcodeScanned}
        />
      </View>

      <CustomModal
        visible={successModalVisible}
        title="QR Code Scanned"
        message="Attendance successfully recorded!"
        type="success"
        onClose={() => setSuccessModalVisible(false)}
        onCancel={() => setSuccessModalVisible(false)}
        cancelTitle="CLOSE"
      />

      <CustomModal
        visible={errorModalVisible}
        title="Error"
        message={errorMessage}
        type="error"
        onClose={() => setErrorModalVisible(false)}
        onCancel={() => setErrorModalVisible(false)}
        cancelTitle="CLOSE"
      />

      {/* Confirmation Modal */}
      <CustomModal
        visible={confirmationModalVisible}
        title="Confirm Attendance"
        message={`Are you sure you want to log attendance for:\n\nStudent ID: ${pendingAttendanceData?.student_id_number}\nEvent Name: ${pendingAttendanceData?.event_name}`}
        type="warning"
        onClose={() => cancelAttendance()}
        onCancel={() => cancelAttendance()}
        confirmTitle="Yes"
        onConfirm={() => confirmAttendance()}
        cancelTitle="No"
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
