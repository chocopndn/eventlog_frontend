import { CameraView, Camera } from "expo-camera";
import { useState, useEffect } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

export default function Scan() {
  const [facing, setFacing] = useState("back");
  const [hasPermission, setHasPermission] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmationModalVisible, setConfirmationModalVisible] =
    useState(false);
  const [pendingAttendanceData, setPendingAttendanceData] = useState(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      } catch (error) {
        setHasPermission(false);
      }
    })();
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>No access to camera</Text>
        <Button
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
          title="Request Permission"
        />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }) => {
    if (!isScanning) return;
    setIsScanning(false);

    try {
      if (!isBase64(data)) {
        throw new Error("Invalid QR Code format");
      }

      const bytes = CryptoJS.AES.decrypt(data, QR_SECRET_KEY);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedText.startsWith("eventlog")) {
        throw new Error("Invalid EventLog QR code");
      }

      const [prefix, eventDateIdStr, studentIdStr] = decryptedText.split("-");
      const eventDateId = parseInt(eventDateIdStr, 10);
      const studentId = studentIdStr;

      if (isNaN(eventDateId) || !studentId) {
        throw new Error("Invalid QR code data");
      }

      const events = await getStoredEvents(eventDateId);
      if (!Array.isArray(events) || events.length === 0) {
        throw new Error("No events found");
      }

      const event = events.find((e) => {
        const possibleDateIds =
          e.event_date_ids || e.dateIds || e.date_ids || e.eventDateIds;
        return possibleDateIds && possibleDateIds.includes(eventDateId);
      });

      if (!event) {
        throw new Error("QR code not valid for current events");
      }

      const { am_in, am_out, pm_in, pm_out, duration, event_name } = event;
      const currentTime = moment().format("HH:mm:ss");

      const calculateWindow = (time) => {
        return time
          ? moment(time, "HH:mm:ss").add(duration, "minutes").format("HH:mm:ss")
          : null;
      };

      const timeChecks = [
        { type: "AM_IN", start: am_in, end: calculateWindow(am_in) },
        { type: "AM_OUT", start: am_out, end: calculateWindow(am_out) },
        { type: "PM_IN", start: pm_in, end: calculateWindow(pm_in) },
        { type: "PM_OUT", start: pm_out, end: calculateWindow(pm_out) },
      ];

      let isValidTime = false;
      let attendanceType = null;

      for (const check of timeChecks) {
        if (check.start && check.end) {
          const currentMoment = moment(currentTime, "HH:mm:ss");
          const startMoment = moment(check.start, "HH:mm:ss");
          const endMoment = moment(check.end, "HH:mm:ss");

          if (currentMoment.isBetween(startMoment, endMoment, null, "[]")) {
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

        const alreadyLogged = await isAlreadyLogged(
          attendanceData.event_date_id,
          attendanceData.student_id_number,
          attendanceData.type
        );

        if (alreadyLogged) {
          const typeDescriptions = {
            AM_IN: "Morning Time In",
            AM_OUT: "Morning Time Out",
            PM_IN: "Afternoon Time In",
            PM_OUT: "Afternoon Time Out",
          };
          setErrorMessage(
            `${
              typeDescriptions[attendanceData.type]
            } already logged for this student.`
          );
          setErrorModalVisible(true);
          return;
        }

        setPendingAttendanceData(attendanceData);
        setConfirmationModalVisible(true);
      } else {
        const currentTimeFormatted = moment(currentTime, "HH:mm:ss").format(
          "h:mm A"
        );
        setErrorMessage(
          `Current time (${currentTimeFormatted}) is outside valid attendance hours.`
        );
        setErrorModalVisible(true);
      }
    } catch (error) {
      setErrorMessage(error.message || "Invalid QR Code");
      setErrorModalVisible(true);
    }
  };

  const confirmAttendance = async () => {
    try {
      await logAttendance(pendingAttendanceData);
      setSuccessModalVisible();
      syncAttendance().catch(() => {});
    } catch (error) {
      setErrorMessage("Failed to log attendance");
      setErrorModalVisible(true);
    } finally {
      setConfirmationModalVisible(false);
      setPendingAttendanceData(null);
      setIsScanning(true);
    }
  };

  const cancelAttendance = () => {
    setConfirmationModalVisible(false);
    setPendingAttendanceData(null);
    setIsScanning(true);
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
    setIsScanning(true);
  };

  const isModalVisible =
    successModalVisible || errorModalVisible || confirmationModalVisible;

  return (
    <View style={globalStyles.secondaryContainer}>
      <Text style={styles.note}>Find a QR Code to scan</Text>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          onBarcodeScanned={
            isModalVisible || !isScanning ? undefined : handleBarcodeScanned
          }
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />
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
        onClose={cancelAttendance}
        onCancel={cancelAttendance}
        confirmTitle="Yes"
        onConfirm={confirmAttendance}
        cancelTitle="No"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.large,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
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
  note: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.huge,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
    fontFamily: theme.fontFamily.SquadaOne,
  },
});
