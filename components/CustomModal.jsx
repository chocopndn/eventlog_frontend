import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import theme from "../constants/theme";
import images from "../constants/images";

const CustomModal = ({ visible, title, message, type, onClose }) => {
  let iconSource;
  if (type === "success") {
    iconSource = images.success;
  } else if (type === "error") {
    iconSource = images.error;
  } else if (type === "warning") {
    iconSource = images.warning;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {iconSource && <Image source={iconSource} style={styles.icon} />}

          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 100,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  title: {
    fontSize: theme.fontSizes.huge,
    color: theme.colors.primary,
    marginBottom: 10,
    fontFamily: "SquadaOne",
    textAlign: "center",
  },
  message: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
    marginBottom: 20,
    fontFamily: "Arial",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.medium,
  },
  buttonText: {
    color: theme.colors.secondary,
    fontSize: theme.fontSizes.large,
    fontFamily: "SquadaOne",
  },
  icon: {
    width: 100,
    height: 100,
    tintColor: theme.colors.primary,
    marginBottom: theme.spacing.medium,
  },
});

export default CustomModal;
