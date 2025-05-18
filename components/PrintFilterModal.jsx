import React, { useState } from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import CustomButton from "../components/CustomButton";
import theme from "../constants/theme";
import CustomDropdown from "../components/CustomDropdown";

const PrintFilterModal = ({
  visible,
  onClose,
  onPrint,
  showDepartment = false,
  showBlock = false,
  showYearLevel = false,
  departments = [],
  blocks = [],
  yearLevels = [],
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedYearLevel, setSelectedYearLevel] = useState(null);

  const handlePrint = () => {
    onPrint({
      departmentId: selectedDepartment,
      blockId: selectedBlock,
      yearLevelId: selectedYearLevel,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Print Options</Text>

          <View style={styles.dropdownContainer}>
            {showDepartment && (
              <CustomDropdown
                title="Department"
                placeholder="Select Department"
                data={departments}
                selectedValue={selectedDepartment}
                onValueChange={setSelectedDepartment}
              />
            )}
            {showBlock && (
              <CustomDropdown
                title="Block"
                placeholder="Select Block"
                data={blocks}
                selectedValue={selectedBlock}
                onValueChange={setSelectedBlock}
              />
            )}
            {showYearLevel && (
              <CustomDropdown
                title="Year Level"
                placeholder="Select Year Level"
                data={yearLevels}
                selectedValue={selectedYearLevel}
                onValueChange={setSelectedYearLevel}
              />
            )}
          </View>

          <View style={styles.buttonWrapper}>
            <View style={styles.buttonContainer}>
              <CustomButton
                title="Print"
                onPress={handlePrint}
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
  buttonWrapper: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  dropdownContainer: {
    width: "90%",
    gap: 12,
  },
  buttonContainer: {
    width: "45%",
  },
});
