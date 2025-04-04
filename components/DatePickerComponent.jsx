import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import theme from "../constants/theme";

const DatePickerComponent = ({
  label,
  title,
  onDateChange,
  selectedValue: initialSelectedValues = [],
  mode = "multiple",
  fetchData,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDatesInternal, setSelectedDatesInternal] = useState(() => {
    if (Array.isArray(initialSelectedValues)) {
      return initialSelectedValues
        .map((date) => new Date(date))
        .sort((a, b) => a - b);
    }
    return [];
  });

  const [tempDate, setTempDate] = useState(
    selectedDatesInternal.length > 0 ? selectedDatesInternal[0] : new Date()
  );

  const [initiallyFetchedDates, setInitiallyFetchedDates] = useState([]);
  const hasFetchedInitial = useRef(false);

  useEffect(() => {
    const populateDatesFromFetch = async () => {
      if (typeof fetchData === "function" && !hasFetchedInitial.current) {
        try {
          const response = await fetchData();
          if (response?.success && response?.event?.all_dates) {
            const fetchedDate = new Date(response.event.all_dates);
            if (!isNaN(fetchedDate)) {
              const formattedFetchedDate = formatDateValue(fetchedDate);

              if (
                mode === "multiple" &&
                !initiallyFetchedDates.some(
                  (d) => formatDateValue(d) === formattedFetchedDate
                )
              ) {
                const newInit = [...initiallyFetchedDates, fetchedDate].sort(
                  (a, b) => a - b
                );
                setInitiallyFetchedDates(newInit);

                const newSelected = [
                  ...selectedDatesInternal,
                  fetchedDate,
                ].sort((a, b) => a - b);
                setSelectedDatesInternal(newSelected);
                onDateChange?.(newSelected.map(formatDateValue));
              } else if (mode === "single") {
                setInitiallyFetchedDates([fetchedDate]);
                setSelectedDatesInternal([fetchedDate]);
                onDateChange?.(formatDateValue(fetchedDate));
              }

              hasFetchedInitial.current = true;
            }
          }
        } catch (error) {
          console.error("Error fetching initial dates:", error.message);
        }
      }
    };

    populateDatesFromFetch();
  }, [mode, onDateChange, initialSelectedValues, fetchData]);

  const formatDisplayDate = (date) => {
    if (!date) return "";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  const formatDateValue = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowPicker(false);

    if (selectedDate) {
      try {
        setTempDate(selectedDate);

        if (mode === "multiple") {
          const formattedValue = formatDateValue(selectedDate);
          const isCurrentlySelected = selectedDatesInternal.some(
            (date) => formatDateValue(date) === formattedValue
          );

          let newSelectedDates = [...selectedDatesInternal];
          if (isCurrentlySelected) {
            newSelectedDates = newSelectedDates.filter(
              (date) => formatDateValue(date) !== formattedValue
            );
          } else {
            newSelectedDates.push(selectedDate);
            newSelectedDates.sort((a, b) => a - b);
          }

          setSelectedDatesInternal(newSelectedDates);
          onDateChange?.(newSelectedDates.map(formatDateValue));
        } else {
          setSelectedDatesInternal([selectedDate]);
          onDateChange?.(formatDateValue(selectedDate));
        }
      } catch (error) {
        console.error("Error handling date change:", error.message);
      }
    } else {
      setSelectedDatesInternal([]);
      onDateChange?.(null);
    }
  };

  const formattedDisplay =
    mode === "multiple"
      ? selectedDatesInternal.length > 0
        ? "Select dates"
        : "No dates selected"
      : selectedDatesInternal.length > 0
      ? formatDisplayDate(selectedDatesInternal[0])
      : "Select date";

  return (
    <View>
      {title && <Text style={styles.titleText}>{title}</Text>}
      <TouchableOpacity
        style={styles.container}
        onPress={() => setShowPicker(true)}
        accessibilityRole="button"
        accessibilityLabel="Open date picker"
      >
        {label && <Text style={styles.label}>{label}</Text>}
        <Text style={styles.dateDisplay}>{formattedDisplay}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={tempDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      {mode === "multiple" &&
        Array.isArray(selectedDatesInternal) &&
        selectedDatesInternal.length > 0 && (
          <View style={styles.selectedDatesDisplay}>
            <Text style={styles.selectedDatesTitle}>SELECTED DATES:</Text>
            <View>
              {selectedDatesInternal.map((date) => (
                <Text key={date.toISOString()} style={styles.selectedDateItem}>
                  {formatDisplayDate(date)}
                </Text>
              ))}
            </View>
          </View>
        )}
    </View>
  );
};

export default DatePickerComponent;

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
  selectedDatesDisplay: {
    marginTop: theme.spacing.small,
    padding: theme.spacing.small,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.borderRadius.small,
  },
  selectedDatesTitle: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.ArialBold,
    fontSize: theme.fontSizes.small,
    marginBottom: theme.spacing.tiny,
  },
  selectedDateItem: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    marginBottom: theme.spacing.tiny / 2,
  },
});
