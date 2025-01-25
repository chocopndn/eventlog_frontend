import React from "react";
import { Modal, View, Text, TouchableOpacity, StatusBar } from "react-native";

const CustomModal = ({
  visible,
  onClose,
  title = "Error",
  message = "An unexpected error occurred.",
  type = "error",
  buttonText = "Okay",
  buttonAction = onClose,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <StatusBar
        backgroundColor="rgba(0, 0, 0, 0.5)"
        barStyle="light-content"
        translucent
      />

      <View className="absolute top-0 left-0 right-0 bottom-0 flex-1 bg-black/50 justify-center items-center">
        <View className="w-4/5 bg-secondary p-6 rounded-lg items-center shadow-xl">
          <Text className="font-SquadaOne text-4xl mb-4 text-primary">
            {title}
          </Text>
          <Text className="mb-6 font-Arial text-lg text-center">{message}</Text>
          <TouchableOpacity
            onPress={buttonAction}
            className={`px-5 py-3 rounded-md ${
              type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <Text className="text-white font-bold">{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;
