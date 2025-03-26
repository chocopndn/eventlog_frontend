import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import theme from "../constants/theme";

const CustomDropdown = ({
  data = [],
  placeholder = "Select an option",
  onSelect,
  value,
  title,
  display,
  titleColor = "primary",
  multiSelect = false,
}) => {
  const [selectedValue, setSelectedValue] = useState(
    multiSelect ? value || [] : value || null
  );

  useEffect(() => {
    if (value !== undefined && value !== selectedValue) {
      setSelectedValue(value);
    }
  }, [value, selectedValue]);

  const handleChange = (item) => {
    setSelectedValue(item);
    onSelect?.(item);
  };

  const getDropdownStyle = () => {
    const baseStyle = {
      height: 50,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.secondary,
      padding: theme.spacing.medium,
    };
    return display === "sharp"
      ? { ...baseStyle, borderRadius: 0 }
      : { ...baseStyle, borderRadius: theme.borderRadius.medium };
  };

  const getTitleStyle = () => {
    const color =
      titleColor === "primary" ? theme.colors.primary : theme.colors.secondary;
    return { ...styles.title, color };
  };

  return (
    <View style={styles.container}>
      {title ? <Text style={getTitleStyle()}>{title}</Text> : null}
      {multiSelect ? (
        <MultiSelect
          data={data.length > 0 ? data : []}
          labelField="label"
          valueField="value"
          value={selectedValue}
          onChange={handleChange}
          placeholder={placeholder}
          style={getDropdownStyle()}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          itemTextStyle={styles.itemTextStyle}
          itemContainerStyle={styles.itemContainerStyle}
          inputSearchStyle={styles.inputSearchStyle}
          selectedStyle={styles.selectedStyle}
          searchPlaceholderTextColor={theme.colors.gray}
        />
      ) : (
        <Dropdown
          data={data.length > 0 ? data : []}
          labelField="label"
          valueField="value"
          value={selectedValue}
          onChange={handleChange}
          placeholder={placeholder}
          style={getDropdownStyle()}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          itemTextStyle={styles.itemTextStyle}
          itemContainerStyle={styles.itemContainerStyle}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    marginBottom: theme.spacing.small,
    fontFamily: "Arial",
  },
  placeholderStyle: {
    fontSize: theme.fontSizes.medium,
    color: "#888",
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  itemTextStyle: {
    color: theme.colors.primary,
  },
  itemContainerStyle: {
    backgroundColor: theme.colors.secondary,
  },
});

export default CustomDropdown;
