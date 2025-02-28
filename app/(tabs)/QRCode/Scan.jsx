import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { Text, View, Image } from "react-native";
import CustomModal from "../../../components/CustomModal";
import { getStoredEvents } from "../../../database/queries";
import images from "../../../constants/images";
import CryptoES from "crypto-es";
import config from "../../../config/config";

export default function Scan() {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [decryptedData, setDecryptedData] = useState(null);
  const [eventName, setEventName] = useState("N/A");

  useEffect(() => {
    if (!permission || permission.status !== "granted") {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = async ({ data }) => {
    if (modalVisible) return;

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
        if (foundEvent) {
          setEventName(foundEvent.event_name);
        } else {
          setEventName("Event Not Found");
        }
      } else {
        setScannedData("Invalid QR code");
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Decryption Error:", error);
      setScannedData("Invalid QR code");
      setModalVisible(true);
    }
  };

  const handleConfirm = () => {
    closeModal();
  };

  const handleDecline = () => {
    closeModal();
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => {
      setScannedData(null);
      setDecryptedData(null);
      setEventName("N/A");
    }, 1000);
  };

  if (!permission || permission.status !== "granted") {
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
      {!modalVisible && (
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
            message={scannedData || "No Data"}
            type="qr"
            buttonText="CONFIRM"
            secondButtonText="DECLINE"
            buttonRedirect={null}
            eventName={eventName}
            idNumber={decryptedData ? decryptedData.idNumber : "N/A"}
            studentName={decryptedData ? decryptedData.fullName : "N/A"}
            onConfirm={handleConfirm}
            onDecline={handleDecline}
          />
        </View>
      )}
    </View>
  );
}
