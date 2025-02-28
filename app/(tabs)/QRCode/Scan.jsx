import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";
import { Text, View, Image } from "react-native";
import CustomModal from "../../../components/CustomModal";
import { getStoredUser, getStoredEvent } from "../../../database/queries";
import images from "../../../constants/images";

export default function Scan() {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!permission || permission.status !== "granted") {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = ({ data }) => {
    if (modalVisible) return;
    setScannedData(data);
    setModalVisible(true);
  };

  const handleConfirm = () => {
    closeModal();
  };

  const handleDecline = () => {
    closeModal();
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setScannedData(null), 1000);
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
            eventName="IT Day"
            idNumber="19015236"
            studentName="Dhanrev Mina"
            onConfirm={handleConfirm}
            onDecline={handleDecline}
          />
        </View>
      )}
    </View>
  );
}
