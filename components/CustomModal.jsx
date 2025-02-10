import React from "react";
import { Modal, View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import images from "../constants/images";

const CustomModal = ({
  visible,
  onClose,
  title,
  message,
  type = "error",
  buttonText = "OK",
  buttonRedirect,
  secondButtonText,
}) => {
  const router = useRouter();

  const handlePrimaryAction = () => {
    if (buttonRedirect) {
      router.replace(buttonRedirect);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className="w-80 p-6 rounded-lg items-center justify-center shadow-lg shadow-black/20 bg-red-100 dark:bg-red-900"
          style={{ elevation: 10, alignSelf: "center" }}
        >
          <Image source={images[type]} className="w-24 h-24 mb-4" />
          <Text className="text-lg font-bold text-red-700 dark:text-red-300">
            {title}
          </Text>
          <Text className="text-sm text-center mb-5 text-red-600 dark:text-red-400">
            {message}
          </Text>
          <View className="flex-row w-full justify-center">
            <TouchableOpacity
              className="p-3 px-6 rounded-lg bg-red-500 dark:bg-red-700"
              onPress={handlePrimaryAction}
            >
              <Text className="text-white text-center">{buttonText}</Text>
            </TouchableOpacity>
            {secondButtonText && (
              <TouchableOpacity
                className="p-3 px-6 rounded-lg bg-gray-500 dark:bg-gray-700 ml-3"
                onPress={onClose}
              >
                <Text className="text-white text-center">
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
