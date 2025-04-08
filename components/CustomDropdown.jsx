import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Dropdown, MultiSelect } from "react-native-element-dropdown";
import theme from "../constants/theme";

const CustomDropdown = ({
  data = [],
  placeholder = "Select an option",
  onSelect,
  value: initialValue,
  title,
  display = "rounded",
  titleColor = "primary",
  multiSelect = false,
  fontFamily = "Arial",
  placeholderFontSize = theme.fontSizes.medium,
  placeholderColor = "#888",
}) => {
  const [value, setValue] = useState(initialValue || (multiSelect ? [] : null));
  const [selectAllLabel, setSelectAllLabel] = useState("Select All");

  useEffect(() => {
    setValue(initialValue || (multiSelect ? [] : null));
  }, [initialValue, multiSelect]);

  useEffect(() => {
    if (multiSelect && data.length > 0) {
      if (value.length === data.length) {
        setSelectAllLabel("Deselect All");
      } else {
        setSelectAllLabel("Select All");
      }
    }
  }, [value, data, multiSelect]);

  const handleChange = (selectedItems) => {
    if (multiSelect) {
      const selectAllValue = "select_all";
      const allValuesExceptSelectAll = data
        .filter((item) => item.value !== selectAllValue)
        .map((item) => item.value);

      if (selectedItems.includes(selectAllValue) && data.length > 0) {
        if (value.length === data.length) {
          setValue([]);
          onSelect?.([]);
        } else {
          setValue(allValuesExceptSelectAll);
          onSelect?.(allValuesExceptSelectAll);
        }
      } else {
        setValue(selectedItems.filter((item) => item !== selectAllValue));
        onSelect?.(selectedItems.filter((item) => item !== selectAllValue));
      }
    } else {
      setValue(selectedItems);
      onSelect?.(selectedItems);
    }
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
    return { ...styles.title, color, fontFamily };
  };

  const customPlaceholder = () => {
    if (multiSelect && Array.isArray(value) && value.length > 0) {
      return `${value.length} selected`;
    }
    return placeholder;
  };

  const getPlaceholderStyle = () => {
    return {
      ...styles.placeholderStyle,
      fontSize: placeholderFontSize,
      color: (
        multiSelect ? Array.isArray(value) && value.length > 0 : value !== null
      )
        ? theme.colors.primary
        : placeholderColor,
      fontFamily,
    };
  };

  const getMultiSelectData = () => {
    if (data.length > 0) {
      return [{ label: selectAllLabel, value: "select_all" }, ...data];
    }
    return data;
  };

  return (
    <View style={styles.container}>
      {title ? <Text style={getTitleStyle()}>{title}</Text> : null}
      {multiSelect ? (
        <MultiSelect
          data={getMultiSelectData()}
          labelField="label"
          valueField="value"
          value={value}
          onChange={handleChange}
          placeholder={customPlaceholder()}
          style={getDropdownStyle()}
          placeholderStyle={getPlaceholderStyle()}
          selectedTextStyle={{
            ...styles.selectedTextStyle,
            fontFamily,
          }}
          itemTextStyle={{ ...styles.itemTextStyle, fontFamily }}
          itemContainerStyle={styles.itemContainerStyle}
          inputSearchStyle={styles.inputSearchStyle}
          searchPlaceholderTextColor={theme.colors.gray}
          renderSelectedItem={(item, unSelect) => (
            <TouchableOpacity onPress={() => unSelect && unSelect(item)} />
          )}
        />
      ) : (
        <Dropdown
          data={data.length > 0 ? data : []}
          labelField="label"
          valueField="value"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          style={getDropdownStyle()}
          placeholderStyle={getPlaceholderStyle()}
          selectedTextStyle={{
            ...styles.selectedTextStyle,
            fontFamily,
          }}
          itemTextStyle={{ ...styles.itemTextStyle, fontFamily }}
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
  },
  placeholderStyle: {
    fontSize: theme.fontSizes.medium,
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
