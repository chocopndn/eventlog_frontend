import { StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import CryptoJS from "crypto-js";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import CustomModal from "../../../../components/CustomModal";
import { QR_SECRET_KEY } from "../../../../config/config";

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

  const handleBarcodeScanned = ({ data }) => {
    try {
      if (!isBase64(data)) {
        throw new Error();
      }

      const bytes = CryptoJS.AES.decrypt(data, QR_SECRET_KEY);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedText || !decryptedText.includes("eventlog")) {
        throw new Error();
      }

      setSuccessModalVisible(true);
    } catch {
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
