import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import images from "../constants/images";

const SharpDropdown = ({
  title,
  data = [],
  defaultValue = null,
  onSelect,
  placeholder = "Select an option",
  search = false,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    if (onSelect) {
      onSelect(value);
    }
  }, [value, onSelect]);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const dropdownData = useMemo(() => {
    return data.length > 0
      ? data
      : [{ label: "No options available", value: null }];
  }, [data]);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <Dropdown
        style={[styles.dropdown, isFocus ? styles.dropdownFocused : null]}
        placeholder={placeholder}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={dropdownData}
        labelField="label"
        valueField="value"
        search={search}
        maxHeight={300}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => setValue(item.value)}
        renderRightIcon={() =>
          !isFocus && <Image source={images.arrowDown} style={styles.icon} />
        }
        containerStyle={styles.containerStyle}
      />
    </View>
  );
};

export default SharpDropdown;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  dropdown: {
    height: 50,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
  },
  dropdownFocused: {
    borderColor: "#007AFF",
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#888",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#333",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    paddingHorizontal: 10,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: "#666",
  },
  containerStyle: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#ccc",
  },
});
