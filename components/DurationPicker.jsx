import React, { useState } from "react";
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

const DurationPicker = ({ visible, onClose, onDurationSelect }) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const handleDone = () => {
    onDurationSelect(hours * 60 + minutes);
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
            />
            <Text style={styles.separator}>:</Text>
            <WheelPickerExpo
              items={Array.from({ length: 60 }, (_, i) => ({
                label: `${i} mins`,
                value: i,
              }))}
              selectedValue={minutes}
              onChange={({ item }) => setMinutes(item.value)}
              height={150}
              width={100}
            />
          </View>

          <Text style={styles.selectedText}>
            Selected: {hours * 60 + minutes} minutes
          </Text>

          {/* Done Button */}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: "center",
    elevation: 5,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
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
  selectedText: {
    marginTop: 10,
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
  },
  doneButton: {
    marginTop: 10,
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 5,
    width: "50%",
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: theme.fontSizes.medium,
  },
});

export default DurationPicker;
