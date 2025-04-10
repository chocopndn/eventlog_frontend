import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import theme from "../constants/theme";

const TimePickerComponent = ({
  label,
  title,
  onTimeChange,
  selectedValue = null,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(selectedValue || null);

  const handleTimeChange = (event, selectedTime) => {
    if (event.type === "set") {
      setShowPicker(false);

      if (selectedTime) {
        const hours = selectedTime.getHours();
        const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
        const seconds = selectedTime.getSeconds().toString().padStart(2, "0");

        const formattedTime = `${hours
          .toString()
          .padStart(2, "0")}:${minutes}:${seconds}`;

        const isPM = hours >= 12;
        const formattedHours =
          hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        const ampm = isPM ? "PM" : "AM";
        const displayTime = `${formattedHours
          .toString()
          .padStart(2, "0")}:${minutes} ${ampm}`;

        setSelectedTime(displayTime);
        onTimeChange?.(formattedTime);
      }
    } else if (event.type === "dismissed") {
      setShowPicker(false);
    }
  };

  const handleLongPress = () => {
    setSelectedTime(null);
    onTimeChange?.(null);
  };

  const formattedDisplay = !selectedTime ? "Select time" : selectedTime;

  return (
    <View>
      {title && <Text style={styles.titleText}>{title}</Text>}
      <TouchableOpacity
        style={styles.container}
        onPress={() => setShowPicker(true)}
        onLongPress={handleLongPress}
        accessibilityRole="button"
        accessibilityLabel="Open time picker"
      >
        {label && <Text style={styles.label}>{label}</Text>}
        <Text style={styles.dateDisplay}>{formattedDisplay}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          display="default"
          onChange={handleTimeChange}
          is24Hour={false}
        />
      )}
    </View>
  );
};

export default TimePickerComponent;

const styles = StyleSheet.create({
  container: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 46,
  },
  dateDisplay: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
  },
  label: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.ArialBold,
    fontSize: theme.fontSizes.small,
    marginBottom: theme.spacing.tiny,
  },
  titleText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
    paddingBottom: theme.spacing.small,
    fontFamily: theme.fontFamily.ArialBold,
  },
});
