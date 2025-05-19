import React, { useState } from "react";
import { Modal, View, Text, StyleSheet, Platform } from "react-native";
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
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [selectedYearLevels, setSelectedYearLevels] = useState([]);

  const handlePrint = () => {
    onPrint({
      departmentIds: selectedDepartments,
      blockIds: selectedBlocks,
      yearLevelIds: selectedYearLevels,
    });
    onClose();
  };

  // Remove the "All Departments" item from the department dropdown
  const filteredDepartments = departments.filter((dept) => dept.value !== "");

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Print Options</Text>

          <View style={styles.dropdownContainer}>
            {showDepartment && (
              <CustomDropdown
                title="Departments"
                placeholder="Select Departments"
                data={filteredDepartments}
                value={selectedDepartments}
                onSelect={setSelectedDepartments}
                multiSelect
              />
            )}
            {showBlock && (
              <CustomDropdown
                title="Blocks"
                placeholder="Select Blocks"
                data={blocks}
                value={selectedBlocks}
                onSelect={setSelectedBlocks}
                multiSelect
              />
            )}
            {showYearLevel && (
              <CustomDropdown
                title="Year Levels"
                placeholder="Select Year Levels"
                data={yearLevels}
                value={selectedYearLevels}
                onSelect={setSelectedYearLevels}
                multiSelect
              />
            )}
          </View>

          <View style={styles.buttonWrapper}>
            <View style={styles.buttonContainer}>
              <CustomButton
                title={Platform.OS === "web" ? "Print" : "Download"}
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
