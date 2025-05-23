import React, { useState, useEffect } from "react";
import { Modal, View, Text, StyleSheet, Platform, Alert } from "react-native";
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
  title = "Download",
}) => {
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [selectedYearLevels, setSelectedYearLevels] = useState([]);
  const [filteredBlocks, setFilteredBlocks] = useState(blocks);

  useEffect(() => {
    if (visible) {
      setSelectedDepartments([]);
      setSelectedBlocks([]);
      setSelectedYearLevels([]);
    }
  }, [visible]);

  useEffect(() => {
    let filtered = [...blocks];

    if (selectedDepartments.length > 0) {
      filtered = filtered.filter((block) =>
        selectedDepartments.includes(String(block.department_id))
      );
    }

    if (selectedYearLevels.length > 0) {
      filtered = filtered.filter((block) =>
        selectedYearLevels.includes(String(block.year_level_id))
      );
    }

    setFilteredBlocks(filtered);
    setSelectedBlocks([]);
  }, [selectedDepartments, selectedYearLevels, blocks]);

  const handlePrint = () => {
    if (blocks.length === 0) {
      Alert.alert(
        "No Blocks Available",
        "There are no blocks to print. Please add blocks first."
      );
      return;
    }

    if (selectedBlocks.length === 0) {
      Alert.alert("No Selection", "Please select at least one block to print.");
      return;
    }

    onPrint({
      departmentIds: selectedDepartments,
      blockIds: selectedBlocks,
      yearLevelIds: selectedYearLevels,
    });

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.dropdownContainer}>
            {showDepartment && (
              <CustomDropdown
                title="Departments"
                placeholder="Select Departments"
                data={departments}
                value={selectedDepartments}
                onSelect={(values) => setSelectedDepartments(values)}
                multiSelect
              />
            )}

            {showYearLevel && (
              <CustomDropdown
                title="Year Levels"
                placeholder="Select Year Levels"
                data={yearLevels}
                value={selectedYearLevels}
                onSelect={(values) => setSelectedYearLevels(values)}
                multiSelect
              />
            )}

            {showBlock && (
              <CustomDropdown
                title={`Blocks (${selectedBlocks.length} selected)`}
                placeholder="Select Blocks"
                data={filteredBlocks.map((block) => ({
                  label: block.display_name,
                  value: String(block.block_id),
                }))}
                value={selectedBlocks}
                onSelect={(values) => setSelectedBlocks(values)}
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
  dropdownContainer: {
    width: "90%",
    gap: 12,
  },
  buttonWrapper: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonContainer: {
    width: "45%",
  },
  customButton: {
    backgroundColor: theme.colors.primary,
  },
  customButtonText: {
    color: theme.colors.secondary,
  },
});
