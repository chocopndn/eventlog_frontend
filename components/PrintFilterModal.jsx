import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import CustomButton from "../components/CustomButton";
import theme from "../constants/theme";
import CustomDropdown from "../components/CustomDropdown";

const PrintFilterModal = ({
  visible,
  onClose,
  showDepartment = false,
  showBlock = false,
  showYearLevel = false,
}) => {
  const showAny = showDepartment || showBlock || showYearLevel;

  const renderDepartment = showAny ? showDepartment : true;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Print Options</Text>
          <View style={styles.dropdownContainer}>
            {renderDepartment && (
              <CustomDropdown
                title="Department"
                placeholder="Select Department"
              />
            )}
            {showBlock && (
              <CustomDropdown title="Block" placeholder="Select Block" />
            )}
            {showYearLevel && (
              <CustomDropdown
                title="Year Level"
                placeholder="Select Year Level"
              />
            )}
          </View>

          <View style={styles.buttonWrapper}>
            <View style={styles.buttonContainer}>
              <CustomButton
                title="Print"
                onPress={onClose}
                style={styles.customButton}
                textStyle={styles.customButtonText}
              />
            </View>
            <View style={styles.buttonContainer}>
              <CustomButton
                title="Close"
                onPress={onClose}
                style={styles.customButton}
                textStyle={styles.customButtonText}
                type="secondary"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PrintFilterModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: theme.colors.secondary,
    padding: 20,
    borderColor: theme.colors.primary,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: theme.fontSizes.huge,
    fontFamily: theme.fontFamily.SquadaOne,
    marginBottom: 10,
    color: theme.colors.primary,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonWrapper: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dropdownContainer: {
    width: "90%",
  },
  buttonContainer: {
    width: "45%",
  },
});
