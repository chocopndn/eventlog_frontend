import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import theme from "../constants/theme";

const CustomDropdown = ({
  data = [],
  placeholder = "Select an option",
  onSelect,
  value,
  title,
}) => {
  const [selectedValue, setSelectedValue] = useState(value || null);

  useEffect(() => {
    if (value !== undefined && value !== selectedValue) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleChange = (item) => {
    if (selectedValue !== item.value) {
      setSelectedValue(item.value);
      onSelect?.(item.value);
    }
  };

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Dropdown
        data={data.length > 0 ? data : []}
        labelField="label"
        valueField="value"
        value={selectedValue}
        onChange={handleChange}
        placeholder={placeholder}
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={styles.itemTextStyle}
        activeColor={theme.colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.small,
    fontFamily: "Arial",
  },
  dropdown: {
    height: 50,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.medium,
  },
  placeholderStyle: {
    fontSize: theme.fontSizes.medium,
    color: "#888",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: theme.colors.secondary,
  },
  itemTextStyle: {
    color: theme.colors.primary,
  },
});

export default CustomDropdown;
