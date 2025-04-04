import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import theme from "../constants/theme";

const DateTimePickerComponent = ({
  type = "date",
  label,
  title,
  onDateChange,
  selectedValue: initialSelectedValues = [],
  mode = "multiple",
  fetchData,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDatesInternal, setSelectedDatesInternal] = useState(() => {
    if (
      type === "date" &&
      Array.isArray(initialSelectedValues) &&
      mode === "multiple"
    ) {
      return initialSelectedValues
        .map((date) => new Date(date))
        .sort((a, b) => a - b);
    } else if (type === "date" && initialSelectedValues && mode === "single") {
      return initialSelectedValues instanceof Date
        ? initialSelectedValues
        : new Date(initialSelectedValues);
    }
    return type === "date" ? [] : null;
  });

  const [tempDate, setTempDate] = useState(() =>
    type === "date" && selectedDatesInternal.length > 0
      ? selectedDatesInternal[0]
      : null
  );

  const [initiallyFetchedDates, setInitiallyFetchedDates] = useState([]);
  const hasFetchedInitial = useRef(false);

  useEffect(() => {
    const populateDatesFromFetch = async () => {
      if (typeof fetchData === "function") {
        try {
          const response = await fetchData();
          if (response?.success && response?.event?.all_dates) {
            const fetchedDate = response.event.all_dates;
            const newDate = new Date(fetchedDate);
            if (!isNaN(newDate)) {
              const formattedFetchedDate = formatDateValue(newDate);
              if (
                mode === "multiple" &&
                !initiallyFetchedDates.some(
                  (d) => formatDateValue(d) === formattedFetchedDate
                )
              ) {
                setInitiallyFetchedDates((prev) => {
                  const newInit = [...prev, newDate];
                  newInit.sort((a, b) => a - b);
                  return newInit;
                });
                setSelectedDatesInternal((prev) => {
                  const isAlreadySelected = prev.some(
                    (d) => formatDateValue(d) === formattedFetchedDate
                  );
                  if (!isAlreadySelected) {
                    const newSelected = [...prev, newDate];
                    newSelected.sort((a, b) => a - b);
                    return newSelected;
                  }
                  return prev;
                });
                onDateChange?.([
                  ...selectedDatesInternal,
                  formattedFetchedDate,
                ]);
              } else if (mode === "single") {
                setInitiallyFetchedDates([newDate]);
                setSelectedDatesInternal(newDate);
                onDateChange?.(formattedFetchedDate);
              }
              hasFetchedInitial.current = true;
            }
          }
        } catch (error) {}
      } else {
        if (
          type === "date" &&
          Array.isArray(initialSelectedValues) &&
          mode === "multiple"
        ) {
          setSelectedDatesInternal(
            initialSelectedValues
              .map((date) => new Date(date))
              .sort((a, b) => a - b)
          );
        } else if (
          type === "date" &&
          initialSelectedValues &&
          mode === "single"
        ) {
          setSelectedDatesInternal(
            initialSelectedValues instanceof Date
              ? initialSelectedValues
              : new Date(initialSelectedValues)
          );
        }
      }
    };

    if (typeof fetchData === "function" && !hasFetchedInitial.current) {
      populateDatesFromFetch();
    }
  }, [mode, onDateChange, type, initialSelectedValues, fetchData]);

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
        if (type === "date") {
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
            setSelectedDatesInternal(selectedDate);
            onDateChange?.(formatDateValue(selectedDate));
          }
        } else if (type !== "date") {
          const formattedTime = selectedDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          setSelectedDatesInternal(selectedDate);
          onDateChange?.(formattedTime);
        }
      } catch (error) {}
    }
  };

  const formattedDisplay =
    type === "date"
      ? mode === "multiple"
        ? "Select dates"
        : selectedDatesInternal instanceof Date
        ? formatDisplayDate(selectedDatesInternal)
        : "Select date"
      : selectedDatesInternal instanceof Date
      ? selectedDatesInternal.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "Select time";

  return (
    <View>
      {title && <Text style={styles.titleText}>{title}</Text>}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowPicker(true)}
        >
          {label && <Text style={styles.label}>{label}</Text>}
          <Text style={styles.dateDisplay}>{formattedDisplay}</Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={tempDate || new Date()}
            mode={type}
            display="default"
            onChange={handleDateChange}
            is24Hour={false}
          />
        )}
      </View>
      {type === "date" &&
        mode === "multiple" &&
        Array.isArray(selectedDatesInternal) &&
        selectedDatesInternal.length > 0 && (
          <View
            style={[styles.selectedDatesDisplay, { alignItems: "flex-start" }]}
          >
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

export default DateTimePickerComponent;

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
  selectedDatesDisplay: {
    marginTop: theme.spacing.small,
    padding: theme.spacing.small,
    borderColor: theme.colors.primary,
    borderWidth: 1,
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
