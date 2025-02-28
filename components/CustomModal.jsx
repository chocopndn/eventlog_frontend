import React from "react";
import { Modal, View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import images from "../constants/images";

const ALLOWED_TYPES = ["qr", "success", "warning", "error"];

const CustomModal = ({
  visible,
  onClose,
  title,
  message,
  type = "error",
  buttonText = "OK",
  buttonRedirect,
  secondButtonText,
  eventName,
  idNumber,
  studentName,
}) => {
  const router = useRouter();
  const validatedType = ALLOWED_TYPES.includes(type) ? type : "error";

  const handlePrimaryAction = () => {
    if (buttonRedirect) {
      router.replace(buttonRedirect);
    } else {
      onClose();
    }
  };

  const truncateText = (text, maxLength) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="absolute top-0 left-0 right-0 bottom-24 flex items-center justify-center">
        <View
          className="w-[280px] rounded-lg items-center p-6 bg-secondary"
          style={{
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
          }}
        >
          {validatedType === "qr" ? (
            <View className="items-center pb-4">
              <Image
                source={images.success}
                className="w-[80px] h-[80px] mb-3"
                style={{ tintColor: "#255586" }}
              />
              <Text
                className="font-SquadaOne text-primary text-[26px] mb-2"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                QR Code Scanned
              </Text>
              <Text
                className="font-SquadaOne text-[22px] mb-2"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ color: "rgba(37, 85, 134, 0.8)" }}
              >
                {truncateText(eventName, 20)}
              </Text>
              <Text
                className="font-SquadaOne text-[20px] mb-2"
                style={{ color: "rgba(37, 85, 134, 0.8)" }}
              >
                {studentName}
              </Text>
              <Text
                className="font-SquadaOne text-[20px] mb-2"
                style={{ color: "rgba(37, 85, 134, 0.8)" }}
              >
                {idNumber}
              </Text>
            </View>
          ) : (
            <View className="items-center pb-4">
              <Image
                source={images[validatedType]}
                className="w-[80px] h-[80px] mb-3"
                style={{ tintColor: "#255586" }}
              />
              <Text
                className="text-[26px] text-primary font-SquadaOne mb-2"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {truncateText(title, 20)}
              </Text>
              <Text
                className="text-[20px] text-center font-SquadaOne mb-2"
                numberOfLines={3}
                ellipsizeMode="tail"
                style={{ color: "rgba(37, 85, 134, 0.8)" }}
              >
                {message}
              </Text>
            </View>
          )}

          <View className="flex-row w-full justify-center mt-3">
            <TouchableOpacity
              className="h-[40px] w-[100px] rounded-xl bg-primary shadow-md items-center justify-center"
              style={{
                elevation: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
              onPress={handlePrimaryAction}
            >
              <Text className="text-secondary font-SquadaOne text-[20px]">
                {buttonText}
              </Text>
            </TouchableOpacity>

            {secondButtonText && (
              <TouchableOpacity
                className="h-[40px] w-[100px] rounded-xl bg-secondary border-primary border-2 ml-4 shadow-md items-center justify-center"
                style={{
                  elevation: 3,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                }}
                onPress={onClose}
              >
                <Text className="text-primary font-SquadaOne text-[20px]">
                  {secondButtonText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;
