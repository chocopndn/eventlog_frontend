import { StyleSheet, Text, View, Alert, Platform } from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect } from "@react-navigation/native";
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
import { syncAttendance } from "../../../../services/api";

const Scan = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [pendingAttendanceData, setPendingAttendanceData] = useState(null);
  const [cameraKey, setCameraKey] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  const handleCameraPermission = async () => {
    if (!permission) return;
    if (permission.status === "undetermined") {
      const response = await requestPermission();
      if (!response.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please enable camera access in your device settings to scan QR codes.",
          [{ text: "OK" }]
        );
      }
    } else if (permission.status === "denied") {
      Alert.alert(
        "Camera Access Denied",
        "Camera permission is required to scan QR codes. Please go to Settings > Privacy & Security > Camera and enable access for this app.",
        [{ text: "OK" }]
      );
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setCameraKey((prev) => prev + 1);
      setIsCameraReady(false);
      setIsScanning(true);
      handleCameraPermission();
    }, [permission])
  );

  useEffect(() => {
    if (permission) {
      handleCameraPermission();
    }
  }, [permission]);

  useEffect(() => {
    const performAutoSync = async () => {
      try {
        const result = await syncAttendance();
      } catch (error) {}
    };
    performAutoSync();
  }, []);

  if (!permission) {
    return (
      <View style={[globalStyles.secondaryContainer, styles.messageContainer]}>
        <Text style={styles.message}>Initializing camera...</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (permission.status !== "granted") {
    return (
      <View style={[globalStyles.secondaryContainer, styles.messageContainer]}>
        <Text style={styles.message}>
          Camera access is required to scan QR codes
        </Text>
        <Text style={styles.subNote}>
          {Platform.OS === "ios"
            ? "Go to Settings → Privacy & Security → Camera → Your App and enable access"
            : "Go to Settings → Apps → Your App → Permissions → Camera and allow access"}
        </Text>
        <StatusBar style="light" />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }) => {
    if (!isScanning) return;
    setIsScanning(false);
    try {
      if (!isBase64(data)) {
        throw new Error("Invalid QR Code format - not base64");
      }

      let decryptedText;
      try {
        const bytes = CryptoJS.AES.decrypt(data, QR_SECRET_KEY);
        decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      } catch (decryptError) {
        throw new Error("Failed to decrypt QR code");
      }

      if (!decryptedText.startsWith("eventlog")) {
        throw new Error(
          "Invalid QR code format. Please scan an EventLog QR code."
        );
      }

      const [prefix, eventDateIdStr, studentIdStr] = decryptedText.split("-");
      if (prefix !== "eventlog") {
        throw new Error("Invalid QR code format.");
      }

      const eventDateId = parseInt(eventDateIdStr, 10);
      const studentId = studentIdStr;

      if (isNaN(eventDateId) || !studentId) {
        throw new Error("Invalid QR code data.");
      }

      let events;
      try {
        events = await getStoredEvents(eventDateId);
      } catch (dbError) {
        throw new Error("Failed to retrieve event data");
      }

      if (!Array.isArray(events) || events.length === 0) {
        throw new Error("No events found for the given date.");
      }

      const event = events.find((e) => {
        const possibleDateIds =
          e.event_date_ids || e.dateIds || e.date_ids || e.eventDateIds;
        return possibleDateIds && possibleDateIds.includes(eventDateId);
      });

      if (!event) {
        throw new Error(
          "QR code is not valid for current events. Please use a current QR code."
        );
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
      const currentTime = moment().format("HH:mm:ss");

      let isValidTime = false;
      let attendanceType = null;

      const timeChecks = [
        { type: "AM_IN", start: am_in, end: amInWindowEnd },
        { type: "AM_OUT", start: am_out, end: amOutWindowEnd },
        { type: "PM_IN", start: pm_in, end: pmInWindowEnd },
        { type: "PM_OUT", start: pm_out, end: pmOutWindowEnd },
      ];

      for (const check of timeChecks) {
        if (check.start && check.end) {
          const currentMoment = moment(currentTime, "HH:mm:ss");
          const startMoment = moment(check.start, "HH:mm:ss");
          const endMoment = moment(check.end, "HH:mm:ss");
          const isInWindow = currentMoment.isBetween(
            startMoment,
            endMoment,
            null,
            "[]"
          );
          if (isInWindow) {
            isValidTime = true;
            attendanceType = check.type;
            break;
          }
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

        let alreadyLogged;
        try {
          alreadyLogged = await isAlreadyLogged(
            attendanceData.event_date_id,
            attendanceData.student_id_number,
            attendanceData.type
          );
        } catch (checkError) {
          throw new Error("Failed to verify attendance status");
        }

        if (alreadyLogged) {
          const errorMsg = `${friendlyTypeDescription} attendance already logged for this student.`;
          setErrorMessage(errorMsg);
          setErrorModalVisible(true);
          return;
        }

        setPendingAttendanceData(attendanceData);
        setConfirmationModalVisible(true);
      } else {
        const currentTimeFormatted = moment(currentTime, "HH:mm:ss").format(
          "h:mm A"
        );
        const errorMsg = `Current time (${currentTimeFormatted}) is outside valid attendance hours.`;
        setErrorMessage(errorMsg);
        setErrorModalVisible(true);
      }
    } catch (error) {
      setErrorMessage(error.message || "Please scan a valid EventLog QR Code.");
      setErrorModalVisible(true);
    }
  };

  const confirmAttendance = async () => {
    try {
      await logAttendance(pendingAttendanceData);
      setSuccessModalVisible(true);
      try {
        await syncAttendance();
      } catch (syncError) {}
    } catch (error) {
      if (error.message.includes("has already been logged")) {
        setErrorMessage(error.message);
        setErrorModalVisible(true);
      } else {
        setErrorMessage("Failed to log attendance. Please try again.");
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
    setTimeout(() => {
      setIsScanning(true);
    }, 1000);
  };

  const isBase64 = (str) => {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  };

  const handleModalClose = (setter) => {
    setter(false);
    setTimeout(() => {
      setIsScanning(true);
    }, 1000);
  };

  const isModalVisible =
    successModalVisible || errorModalVisible || confirmationModalVisible;

  const handleCameraReady = () => {
    setIsCameraReady(true);
  };

  const handleCameraError = (error) => {};

  const reloadCamera = () => {
    setCameraKey((prev) => prev + 1);
    setIsCameraReady(false);
    setIsScanning(true);
    setSuccessModalVisible(false);
    setErrorModalVisible(false);
    setConfirmationModalVisible(false);
    setPendingAttendanceData(null);
  };

  return (
    <View style={globalStyles.secondaryContainer}>
      <Text style={styles.note}>Find a QR Code to scan</Text>
      <View style={styles.cameraContainer}>
        {!isCameraReady && (
          <View style={styles.cameraLoadingOverlay}>
            <Text style={styles.cameraLoadingText}>Loading camera...</Text>
          </View>
        )}
        <CameraView
          key={cameraKey}
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={
            isModalVisible || !isScanning ? undefined : handleBarcodeScanned
          }
          onCameraReady={handleCameraReady}
          onMountError={handleCameraError}
          animateShutter={false}
          enableTorch={false}
        />
        <View style={styles.tapToReloadOverlay}>
          <Text style={styles.tapToReloadText} onPress={reloadCamera}>
            Tap to reload camera
          </Text>
        </View>
      </View>

      <CustomModal
        visible={successModalVisible}
        title="QR Code Scanned"
        message="Attendance successfully recorded!"
        type="success"
        onClose={() => handleModalClose(setSuccessModalVisible)}
        onCancel={() => handleModalClose(setSuccessModalVisible)}
        cancelTitle="CLOSE"
      />

      <CustomModal
        visible={errorModalVisible}
        title="Error"
        message={errorMessage}
        type="error"
        onClose={() => handleModalClose(setErrorModalVisible)}
        onCancel={() => handleModalClose(setErrorModalVisible)}
        cancelTitle="CLOSE"
      />

      <CustomModal
        visible={confirmationModalVisible}
        title="Confirm Attendance"
        message={`Are you sure you want to log attendance for:
Student ID: ${pendingAttendanceData?.student_id_number}
Event Name: ${pendingAttendanceData?.event_name}`}
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
    position: "relative",
  },
  cameraLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cameraLoadingText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fontFamily.Arial,
  },
  note: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.huge,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fontFamily.SquadaOne,
  },
  tapToReloadOverlay: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2,
  },
  tapToReloadText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fontFamily.Arial,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    textAlign: "center",
    overflow: "hidden",
  },
});
