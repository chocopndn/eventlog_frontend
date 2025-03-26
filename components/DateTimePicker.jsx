import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import theme from "../constants/theme";

const DatePickerComponent = ({ type = "date", label, title, onDateChange }) => {
  const [date, setDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      onDateChange?.(
        type === "date"
          ? selectedDate.toISOString().split("T")[0]
          : selectedDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
      );
    }
  };

  const handleLongPress = () => {
    setDate(null);
    onDateChange?.(null);
  };

  const formattedDate = date
    ? type === "date"
      ? date.toISOString().split("T")[0]
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : type === "date"
    ? "Select a date"
    : "Select a time";

  return (
    <View>
      {title && <Text style={styles.titleText}>{title}</Text>}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
          onLongPress={handleLongPress}
        >
          {label && <Text style={styles.label}>{label}</Text>}
          <Text style={[styles.dateDisplay, !date && styles.placeholderText]}>
            {formattedDate}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date || new Date()}
            mode={type}
            display="default"
            onChange={handleDateChange}
            is24Hour={true}
          />
        )}
      </View>
    </View>
  );
};

export default DatePickerComponent;

const styles = StyleSheet.create({
  container: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  dateButton: {
    height: 46,
    width: "100%",
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
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
  },
  titleText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
    paddingBottom: theme.spacing.small,
    fontFamily: "Arial",
  },
  placeholderText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.primary,
  },
});
