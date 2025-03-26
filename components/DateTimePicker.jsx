import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import theme from "../constants/theme";

const DatePickerComponent = ({
  type = "date",
  label,
  title,
  onDateChange,
  selectedDates,
  mode,
}) => {
  const [date, setDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      if (onDateChange) {
        if (mode === "multiple") {
          if (selectedDates) {
            const newDate = selectedDate;
            const existingDateIndex = selectedDates.findIndex(
              (d) => d.toDateString() === newDate.toDateString()
            );
            if (existingDateIndex > -1) {
              const updatedDates = [...selectedDates];
              updatedDates.splice(existingDateIndex, 1);
              onDateChange(updatedDates);
            } else {
              onDateChange([...selectedDates, newDate]);
            }
          } else {
            onDateChange([newDate]);
          }
        } else {
          onDateChange(selectedDate);
        }
      }
    }
  };

  const handleLongPress = () => {
    setDate(null);
    if (onDateChange) {
      if (mode === "multiple") {
        onDateChange([]);
      } else {
        onDateChange(null);
      }
    }
  };

  const formattedDate = date
    ? type === "date"
      ? date.toDateString()
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : type === "date"
    ? "Select a date"
    : "Select a time";

  const displayValue =
    mode === "multiple" && selectedDates && selectedDates.length > 0
      ? selectedDates.map((d) => d.toDateString()).join(", ")
      : formattedDate;

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
          <Text
            style={[
              styles.dateDisplay,
              (!date && mode !== "multiple" && styles.placeholderText) ||
                (mode === "multiple" &&
                  (!selectedDates || selectedDates.length === 0) &&
                  styles.placeholderText),
            ]}
          >
            {displayValue === ""
              ? type === "date"
                ? "Select date(s)"
                : "Select a time"
              : displayValue}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={
              date ||
              (mode === "multiple" && selectedDates && selectedDates.length > 0
                ? selectedDates[0]
                : new Date()) ||
              new Date()
            }
            mode={type}
            display="default"
            onChange={onChange}
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
