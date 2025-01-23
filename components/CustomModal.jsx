import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

const CustomModal = ({ visible, onClose, title, message }) => {
  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-4/5 bg-white p-6 border-2 border-primary shadow-lg items-center">
          <Text className="text-lg font-bold text-red-600 mb-4">
            {title || "Error"}
          </Text>
          <Text className="text-base text-gray-700 text-center mb-6">
            {message}
          </Text>
          <TouchableOpacity className="bg-red-600 px-4 py-2" onPress={onClose}>
            <Text className="text-white font-bold">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;
