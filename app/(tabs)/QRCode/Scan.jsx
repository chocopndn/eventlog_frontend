import React, { useEffect, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Text, View, Image, Alert } from "react-native";
import CustomModal from "../../../components/CustomModal";
import { getStoredEvents } from "../../../database/queries";
import images from "../../../constants/images";
import CryptoES from "crypto-es";
import config from "../../../config/config";
import axios from "axios";

const API_URL = config.API_URL;

export default function Scan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState("back");
  const [scannedData, setScannedData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [decryptedData, setDecryptedData] = useState(null);
  const [eventName, setEventName] = useState("N/A");
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    if (permission?.status !== "granted") requestPermission();
  }, [permission]);

  const handleBarcodeScanned = async ({ data }) => {
    if (modalVisible || apiStatus) return;

    try {
      const decryptedBytes = CryptoES.AES.decrypt(data, config.QR_PASS);
      const decryptedString = decryptedBytes.toString(CryptoES.enc.Utf8);
      const parts = decryptedString.split("-");

      if (parts.length === 3) {
        const [fullName, idNumber, eventId] = parts;
        setDecryptedData({ fullName, idNumber, eventId });
        setScannedData(data);
        setModalVisible(true);

        const events = await getStoredEvents();
        const foundEvent = events.find(
          (event) => event.event_id === parseInt(eventId)
        );
        setEventName(foundEvent ? foundEvent.event_name : "Event Not Found");
      } else {
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Decryption Error:", error);
      setModalVisible(true);
    }
  };

  const handleConfirm = async () => {
    try {
      if (!scannedData) return;

      await axios.post(`${API_URL}/api/events/user/attendance`, {
        encryptedData: scannedData,
      });
      setApiStatus("success");
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to record attendance."
      );
      setApiStatus("error");
    } finally {
      setModalVisible(false);
    }
  };

  const handleDecline = () => {
    setApiStatus("declined");
    setModalVisible(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    setScannedData(null);
    setDecryptedData(null);
    setEventName("N/A");
  };

  if (permission?.status !== "granted") {
    return (
      <View className="flex-1 justify-center items-center bg-secondary">
        <Text className="text-center text-primary p-4 font-ArialBold">
          Grant camera access in settings if permission was denied.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-white relative">
      {!modalVisible && !apiStatus && (
        <View className="flex items-center">
          <Text className="text-[30px] font-SquadaOne text-primary mb-10">
            Find a QR Code to scan
          </Text>
          <View className="relative w-[300px] h-[300px] flex items-center justify-center">
            <Image
              source={images.qrscan}
              className="w-[300px] h-[300px]"
              style={{ tintColor: "#255586" }}
            />
            <CameraView
              style={{
                position: "absolute",
                width: 230,
                height: 230,
                borderRadius: 30,
                overflow: "hidden",
              }}
              facing={facing}
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />
          </View>
        </View>
      )}

      {modalVisible && (
        <View className="absolute inset-0 flex justify-center items-center bg-black/50">
          <CustomModal
            visible={modalVisible}
            onClose={closeModal}
            title="QR Code Scanned"
            message={scannedData || "Invalid QR code"}
            type="qr"
            buttonText="CONFIRM"
            secondButtonText="DECLINE"
            eventName={eventName}
            idNumber={decryptedData?.idNumber || "N/A"}
            studentName={decryptedData?.fullName || "N/A"}
            onConfirm={handleConfirm}
            onDecline={handleDecline}
          />
        </View>
      )}

      {apiStatus && (
        <View className="absolute inset-0 flex justify-center items-center bg-black/50">
          <CustomModal
            visible={!!apiStatus}
            onClose={() => setApiStatus(null)}
            title={
              apiStatus === "success"
                ? "Attendance Recorded"
                : "Attendance Not Recorded"
            }
            message={
              apiStatus === "success"
                ? "Attendance has been recorded successfully."
                : "Attendance was not recorded."
            }
            type={apiStatus === "success" ? "success" : "error"}
            buttonText="OK"
          />
        </View>
      )}
    </View>
  );
}
