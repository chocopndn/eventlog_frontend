import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";
import theme from "../constants/theme";

const DurationPicker = ({
  visible,
  onClose,
  onDurationSelect,
  selectedDuration,
}) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (visible && selectedDuration !== undefined) {
      setHours(Math.floor(selectedDuration / 60));
      setMinutes(selectedDuration % 60);
    }
  }, [visible, selectedDuration]);

  const handleDone = () => {
    const totalMinutes = hours * 60 + minutes;
    onDurationSelect(totalMinutes);
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Select Duration</Text>

          <View style={styles.pickerRow}>
            <WheelPickerExpo
              items={Array.from({ length: 24 }, (_, i) => ({
                label: `${i} hrs`,
                value: i,
              }))}
              selectedValue={hours}
              onChange={({ item }) => setHours(item.value)}
              height={150}
              width={100}
              backgroundColor={theme.colors.secondary}
            />
            <Text style={styles.separator}>:</Text>
            <WheelPickerExpo
              items={Array.from({ length: 12 }, (_, i) => ({
                label: `${i * 5} mins`,
                value: i * 5,
              }))}
              selectedValue={minutes}
              onChange={({ item }) => setMinutes(item.value)}
              height={150}
              width={100}
              backgroundColor={theme.colors.secondary}
            />
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
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginHorizontal: 10,
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
