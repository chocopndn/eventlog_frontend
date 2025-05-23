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

  const logError = (context, error, additionalData = {}) => {
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
    const logData = {
      timestamp,
      context,
      error: error?.message || error,
      stack: error?.stack,
      ...additionalData,
    };

    console.error(`[QR Scanner Error - ${context}]`, logData);
  };

  const logInfo = (context, message, data = {}) => {
    const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
    console.log(`[QR Scanner Info - ${context}] ${timestamp}:`, message, data);
  };

  const handleCameraPermission = async () => {
    try {
      logInfo("Camera Permission", "Checking camera permissions", {
        permissionStatus: permission?.status,
      });

      if (!permission) {
        logInfo("Camera Permission", "Permission object not available yet");
        return;
      }

      if (permission.status === "undetermined") {
        logInfo("Camera Permission", "Requesting camera permission");
        const response = await requestPermission();

        logInfo("Camera Permission", "Permission request response", {
          granted: response.granted,
          status: response.status,
        });

        if (!response.granted) {
          logError("Camera Permission", "Permission denied by user", {
            response,
          });
          Alert.alert(
            "Camera Permission Required",
            "Please enable camera access in your device settings to scan QR codes.",
            [{ text: "OK" }]
          );
        }
      } else if (permission.status === "denied") {
        logError("Camera Permission", "Camera access permanently denied", {
          permissionStatus: permission.status,
        });
        Alert.alert(
          "Camera Access Denied",
          "Camera permission is required to scan QR codes. Please go to Settings > Privacy & Security > Camera and enable access for this app.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      logError("Camera Permission", error, {
        permissionStatus: permission?.status,
      });
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      logInfo("Focus Effect", "Screen focused, reinitializing camera");
      setCameraKey((prev) => prev + 1);
      setIsCameraReady(false);
      setIsScanning(true);

      handleCameraPermission();
    }, [permission])
  );

  useEffect(() => {
    if (permission) {
      logInfo("Permission Effect", "Permission state changed", {
        status: permission.status,
      });
      handleCameraPermission();
    }
  }, [permission]);

  if (!permission) {
    logInfo("Render", "Showing camera initialization screen");
    return (
      <View style={[globalStyles.secondaryContainer, styles.messageContainer]}>
        <Text style={styles.message}>Initializing camera...</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (permission.status !== "granted") {
    logInfo("Render", "Showing permission required screen", {
      status: permission.status,
    });
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
    if (!isScanning) {
      logInfo("QR Scan", "Scan ignored - not in scanning state");
      return;
    }

    logInfo("QR Scan", "QR code detected", {
      dataLength: data?.length,
      dataPreview: data?.substring(0, 50) + "...",
    });

    setIsScanning(false);

    try {
      if (!isBase64(data)) {
        throw new Error("Invalid QR Code format - not base64");
      }
      logInfo("QR Processing", "QR code is valid base64");

      let decryptedText;
      try {
        const bytes = CryptoJS.AES.decrypt(data, QR_SECRET_KEY);
        decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        logInfo("QR Processing", "QR code decrypted successfully", {
          decryptedLength: decryptedText.length,
          decryptedPreview: decryptedText.substring(0, 50),
        });
      } catch (decryptError) {
        logError("QR Processing", "Decryption failed", {
          decryptError: decryptError.message,
        });
        throw new Error("Failed to decrypt QR code");
      }

      if (!decryptedText.startsWith("eventlog")) {
        logError(
          "QR Processing",
          "Invalid QR format - doesn't start with eventlog",
          {
            decryptedText,
          }
        );
        throw new Error("Decrypted data is not EventLog-specific.");
      }

      const [prefix, eventDateIdStr, studentIdStr] = decryptedText.split("-");
      logInfo("QR Processing", "QR data parsed", {
        prefix,
        eventDateIdStr,
        studentIdStr,
      });

      if (prefix !== "eventlog") {
        logError("QR Processing", "Invalid prefix", { prefix });
        throw new Error("Decrypted data does not match expected format.");
      }

      const eventDateId = parseInt(eventDateIdStr, 10);
      const studentId = parseInt(studentIdStr, 10);

      if (isNaN(eventDateId) || isNaN(studentId)) {
        logError("QR Processing", "Invalid ID conversion", {
          eventDateIdStr,
          studentIdStr,
          eventDateId,
          studentId,
        });
        throw new Error("Invalid eventDateId or studentId.");
      }

      logInfo("QR Processing", "IDs parsed successfully", {
        eventDateId,
        studentId,
      });

      let events;
      try {
        events = await getStoredEvents(eventDateId);
        logInfo("Database", "Events retrieved", {
          eventCount: events?.length,
          eventDateId,
        });
      } catch (dbError) {
        logError("Database", "Failed to get stored events", {
          dbError: dbError.message,
          eventDateId,
        });
        throw new Error("Failed to retrieve event data");
      }

      if (!Array.isArray(events) || events.length === 0) {
        logError("Database", "No events found", {
          events,
          eventDateId,
        });
        throw new Error("No events found for the given date.");
      }

      logInfo("Database", "Examining event structure", {
        eventCount: events.length,
        eventSample: events[0],
        eventKeys: Object.keys(events[0] || {}),
        searchingForEventDateId: eventDateId,
      });

      const event = events.find((e) => {
        const possibleDateIds =
          e.event_date_ids || e.dateIds || e.date_ids || e.eventDateIds;

        logInfo("Database", "Checking event for date ID match", {
          eventName: e.event_name,
          possibleDateIds: possibleDateIds,
          eventDateId: eventDateId,
          includes: possibleDateIds
            ? possibleDateIds.includes(eventDateId)
            : false,
        });

        return possibleDateIds && possibleDateIds.includes(eventDateId);
      });

      if (!event) {
        const availableEventInfo = events.map((e) => {
          const possibleDateIds =
            e.event_date_ids || e.dateIds || e.date_ids || e.eventDateIds;
          return {
            name: e.event_name,
            dateIds: possibleDateIds,
            allKeys: Object.keys(e),
            rawEvent: e,
          };
        });

        logError("Database", "Event not found in results", {
          eventDateId,
          availableEvents: availableEventInfo,
        });

        const availableInfo = availableEventInfo
          .map(
            (e) => `"${e.name}" (Date IDs: ${e.dateIds?.join(", ") || "none"})`
          )
          .join(", ");

        throw new Error(
          `QR code is for event date ID ${eventDateId}, but this event is not available. ` +
            `Available events: ${availableInfo}. ` +
            `Please use a current QR code or contact your administrator.`
        );
      }

      logInfo("Event Processing", "Event found", {
        eventName: event.event_name,
        eventDateIds: event.event_date_ids,
      });

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

      logInfo("Time Processing", "Time windows calculated", {
        currentTime,
        currentDate,
        timeWindows: {
          amIn: { start: am_in, end: amInWindowEnd },
          amOut: { start: am_out, end: amOutWindowEnd },
          pmIn: { start: pm_in, end: pmInWindowEnd },
          pmOut: { start: pm_out, end: pmOutWindowEnd },
        },
      });

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
          const isInWindow = moment(currentTime, "HH:mm:ss").isBetween(
            moment(check.start, "HH:mm:ss"),
            moment(check.end, "HH:mm:ss")
          );

          logInfo("Time Validation", `Checking ${check.type}`, {
            start: check.start,
            end: check.end,
            currentTime,
            isInWindow,
          });

          if (isInWindow) {
            isValidTime = true;
            attendanceType = check.type;
            break;
          }
        }
      }

      if (isValidTime) {
        logInfo("Attendance Processing", "Valid time slot found", {
          attendanceType,
        });

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
          logInfo("Attendance Check", "Checked existing attendance", {
            alreadyLogged,
            attendanceData,
          });
        } catch (checkError) {
          logError("Attendance Check", "Failed to check existing attendance", {
            checkError: checkError.message,
            attendanceData,
          });
          throw new Error("Failed to verify attendance status");
        }

        if (alreadyLogged) {
          const errorMsg = `Attendance has already been logged.`;
          setErrorMessage(errorMsg);
          setErrorModalVisible(true);
          return;
        }

        logInfo("Attendance Processing", "Ready to confirm attendance", {
          attendanceData,
          friendlyTypeDescription,
        });

        setPendingAttendanceData(attendanceData);
        setConfirmationModalVisible(true);
      } else {
        const errorMsg = "Outside valid attendance slots.";
        logError("Time Validation", errorMsg, {
          currentTime,
          availableSlots: timeChecks.filter((c) => c.start && c.end),
        });
        setErrorMessage(errorMsg);
        setErrorModalVisible(true);
      }
    } catch (error) {
      logError("QR Scan Handler", error, {
        qrData: data?.substring(0, 100),
        errorType: error.constructor.name,
      });
      setErrorMessage("Please scan eventlog-specific QR Code.");
      setErrorModalVisible(true);
    }
  };

  const confirmAttendance = async () => {
    logInfo("Attendance Confirmation", "Attempting to log attendance", {
      pendingAttendanceData,
    });

    try {
      await logAttendance(pendingAttendanceData);
      logInfo("Attendance Confirmation", "Attendance logged successfully", {
        attendanceData: pendingAttendanceData,
      });
      setSuccessModalVisible(true);
    } catch (error) {
      logError("Attendance Confirmation", "Failed to log attendance", {
        error: error.message,
        attendanceData: pendingAttendanceData,
      });

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
    logInfo("Attendance Confirmation", "Attendance cancelled by user");
    setConfirmationModalVisible(false);
    setPendingAttendanceData(null);

    setTimeout(() => {
      logInfo("Scanner State", "Re-enabling scanning after cancellation");
      setIsScanning(true);
    }, 1000);
  };

  const isBase64 = (str) => {
    try {
      const result = btoa(atob(str)) === str;
      logInfo("Base64 Validation", "Validation result", {
        isValid: result,
        stringLength: str?.length,
      });
      return result;
    } catch (validationError) {
      logError("Base64 Validation", "Validation failed", {
        validationError: validationError.message,
        stringPreview: str?.substring(0, 50),
      });
      return false;
    }
  };

  const handleModalClose = (setter) => {
    logInfo("Modal", "Modal closed, re-enabling scanning");
    setter(false);

    setTimeout(() => {
      setIsScanning(true);
    }, 1000);
  };

  const isModalVisible =
    successModalVisible || errorModalVisible || confirmationModalVisible;

  const handleCameraReady = () => {
    logInfo("Camera", "Camera is ready");
    setIsCameraReady(true);
  };

  const handleCameraError = (error) => {
    logError("Camera", "Camera error occurred", {
      error: error?.message || error,
    });
  };

  const reloadCamera = () => {
    logInfo("Camera", "Manual camera reload triggered");
    setCameraKey((prev) => prev + 1);
    setIsCameraReady(false);
    setIsScanning(true);

    setSuccessModalVisible(false);
    setErrorModalVisible(false);
    setConfirmationModalVisible(false);
    setPendingAttendanceData(null);
  };

  logInfo("Render", "Rendering main camera view", {
    isCameraReady,
    isScanning,
    isModalVisible,
  });

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
