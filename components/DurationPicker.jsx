import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import theme from "../constants/theme";

const DURATIONS = [
  { label: "30 mins", value: 30 },
  { label: "1 hr", value: 60 },
  { label: "1 hr 30 mins", value: 90 },
  { label: "2 hrs", value: 120 },
];

const DurationPicker = ({
  visible,
  onClose,
  onDurationSelect,
  selectedDuration,
}) => {
  const [selectedValue, setSelectedValue] = useState(30);

  useEffect(() => {
    if (visible) {
      const closest = DURATIONS.reduce((prev, curr) =>
        Math.abs(curr.value - selectedDuration) <
        Math.abs(prev.value - selectedDuration)
          ? curr
          : prev
      );
      setSelectedValue(closest.value);
    }
  }, [visible, selectedDuration]);

  const handleDone = () => {
    onDurationSelect(selectedValue);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Select Duration</Text>

          <View style={styles.pickerContainer}>
            <Pressable onPress={(e) => e.stopPropagation()}>
              <Picker
                selectedValue={selectedValue}
                onValueChange={(itemValue) => setSelectedValue(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {DURATIONS.map((duration) => (
                  <Picker.Item
                    key={duration.value}
                    label={duration.label}
                    value={duration.value}
                  />
                ))}
              </Picker>
            </Pressable>
          </View>

          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: theme.colors.secondary,
    padding: 20,
    alignItems: "center",
    borderTopWidth: 2,
    borderColor: theme.colors.primary,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.Arial,
    marginBottom: 10,
  },
  pickerContainer: {
    width: "100%",
  },
  picker: {
    width: "100%",
    height: 150,
  },
  pickerItem: {
    fontSize: theme.fontSizes.large,
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.Arial,
  },
  doneButton: {
    marginTop: theme.spacing.large,
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: theme.borderRadius.medium,
    width: "50%",
    alignItems: "center",
  },
  doneButtonText: {
    color: theme.colors.secondary,
    fontSize: theme.fontSizes.medium,
  },
});

export default DurationPicker;
