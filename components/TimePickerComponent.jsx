import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import theme from "../constants/theme";

const { width, height } = Dimensions.get("window");

const TimePickerComponent = ({
  label,
  title,
  onTimeChange,
  selectedValue = null,
  mode = "single",
  allowAM = true,
  allowPM = true,
}) => {
  const [finalAllowAM, setFinalAllowAM] = useState(allowAM);
  const [finalAllowPM, setFinalAllowPM] = useState(allowPM);

  useEffect(() => {
    if (allowPM === true) {
      setFinalAllowAM(false);
      setFinalAllowPM(true);
    } else if (allowAM === true) {
      setFinalAllowPM(false);
      setFinalAllowAM(true);
    } else {
      setFinalAllowAM(allowAM);
      setFinalAllowPM(allowPM);
    }
  }, [allowAM, allowPM]);

  const [showPicker, setShowPicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(selectedValue || null);
  const [tempTime, setTempTime] = useState(null);

  const convertTo12HourFormat = useCallback((date) => {
    if (!date) return null;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const isPM = hours >= 12;
    const formattedHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:00`;
    const displayTime = `${formattedHours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
    return { formattedTime, displayTime, isPM };
  }, []);

  const initialPickerTime = useMemo(() => {
    if (selectedTime) {
      const timeParts = selectedTime.split(" ");
      const [hours, minutes] = timeParts[0].split(":").map(Number);
      const isPM = timeParts[1] === "PM";
      const adjustedHours = isPM
        ? hours === 12
          ? 12
          : hours + 12
        : hours === 12
        ? 0
        : hours;
      const initialDate = new Date();
      initialDate.setHours(adjustedHours, minutes, 0);
      return initialDate;
    }
    return new Date();
  }, [selectedTime]);

  const forceTimeToAllowedRange = useCallback(
    (time) => {
      if (!time) return time;
      const hours = time.getHours();
      const isPM = hours >= 12;

      if (!finalAllowAM && finalAllowPM && !isPM) {
        const pmTime = new Date(time);
        pmTime.setHours(hours + 12);
        return pmTime;
      }

      if (finalAllowAM && !finalAllowPM && isPM) {
        const amTime = new Date(time);
        amTime.setHours(hours - 12);
        return amTime;
      }

      return time;
    },
    [finalAllowAM, finalAllowPM]
  );

  const togglePicker = () => {
    if (showPicker) {
      if (tempTime) {
        const convertedTime = convertTo12HourFormat(tempTime);
        if (convertedTime) {
          if (convertedTime.displayTime !== selectedTime) {
            setSelectedTime(convertedTime.displayTime);
            onTimeChange?.(convertedTime.formattedTime);
          }
        }
      }
      setShowPicker(false);
      setTempTime(null);
    } else {
      setShowPicker(true);
      const initialTime = forceTimeToAllowedRange(initialPickerTime);
      setTempTime(initialTime);
    }
  };

  const handleTimeChange = (event, time) => {
    if (Platform.OS === "android") {
      if (event.type === "dismissed") {
        setShowPicker(false);
        return;
      }
      if (event.type === "set" && time) {
        let adjustedTime;
        const hours = time.getHours();
        const minutes = time.getMinutes();
        if (!finalAllowAM && finalAllowPM) {
          adjustedTime = new Date();
          adjustedTime.setHours(hours < 12 ? hours + 12 : hours, minutes, 0);
        } else if (finalAllowAM && !finalAllowPM) {
          adjustedTime = new Date();
          adjustedTime.setHours(hours >= 12 ? hours - 12 : hours, minutes, 0);
        } else {
          adjustedTime = forceTimeToAllowedRange(time);
        }

        const convertedTime = convertTo12HourFormat(adjustedTime);
        if (convertedTime) {
          setSelectedTime(convertedTime.displayTime);
          onTimeChange?.(convertedTime.formattedTime);
        }
        setShowPicker(false);
      }
    } else if (Platform.OS === "ios") {
      if (time) {
        let adjustedTime;
        const hours = time.getHours();
        const minutes = time.getMinutes();
        if (!finalAllowAM && finalAllowPM) {
          adjustedTime = new Date();
          adjustedTime.setHours(hours < 12 ? hours + 12 : hours, minutes, 0);
        } else if (finalAllowAM && !finalAllowPM) {
          adjustedTime = new Date();
          adjustedTime.setHours(hours >= 12 ? hours - 12 : hours, minutes, 0);
        } else {
          adjustedTime = forceTimeToAllowedRange(time);
        }

        setTempTime(adjustedTime);
      }
    }
  };

  const handleLongPress = () => {
    setSelectedTime(null);
    onTimeChange?.(null);
    setShowPicker(false);
    setTempTime(null);
  };

  const formattedDisplay = !selectedTime ? "Select time" : selectedTime;

  return (
    <View style={styles.container}>
      {title && <Text style={styles.titleText}>{title}</Text>}
      <TouchableOpacity
        style={[styles.pickerButton, showPicker && styles.pickerButtonActive]}
        onPress={togglePicker}
        onLongPress={handleLongPress}
        accessibilityRole="button"
        accessibilityLabel="Toggle time picker"
      >
        {label && <Text style={styles.label}>{label}</Text>}
        <Text style={styles.dateDisplay}>{formattedDisplay}</Text>
      </TouchableOpacity>
      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={tempTime || initialPickerTime}
          mode="time"
          display="default"
          onChange={handleTimeChange}
          is24Hour={false}
          onCancel={() => {
            setShowPicker(false);
          }}
        />
      )}
      {showPicker && Platform.OS === "ios" && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.iosPickerWrapper}>
                <DateTimePicker
                  value={tempTime || initialPickerTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                  is24Hour={false}
                />
                <View style={styles.iosButtonContainer}>
                  <TouchableOpacity
                    onPress={() => setShowPicker(false)}
                    style={styles.iosButton}
                  >
                    <Text style={styles.iosButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={togglePicker}
                    style={styles.iosButton}
                  >
                    <Text style={styles.iosButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default TimePickerComponent;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  pickerButton: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 46,
    backgroundColor: theme.colors.background,
  },
  pickerButtonActive: {
    backgroundColor: theme.colors.primary + "20",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    width: width * 0.9,
    maxWidth: 400,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iosPickerWrapper: {
    width: "100%",
  },
  iosButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iosButton: {
    padding: 10,
  },
  iosButtonText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
  },
});
