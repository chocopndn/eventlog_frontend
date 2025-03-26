import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import theme from "../constants/theme";

const DatePickerComponent = ({ type = "date", label, title }) => {
  const [date, setDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleLongPress = () => {
    setDate(null);
  };

  const formattedDate = date
    ? type === "date"
      ? date.toDateString()
      : date.toLocaleTimeString()
    : type === "date"
    ? "Select a date"
    : "Select a time";

  return (
    <View>
      {title ? <Text style={styles.titleText}>{title}</Text> : null}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
          onLongPress={handleLongPress}
        >
          {label ? <Text style={styles.label}>{label}</Text> : null}
          <Text style={[styles.dateDisplay, !date && styles.placeholderText]}>
            {formattedDate}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date || new Date()}
            mode={type}
            display="default"
            onChange={onChange}
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
    backgroundColor: theme.colors.secondary,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
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
