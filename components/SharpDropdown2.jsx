import React, { useState, useEffect, useMemo } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import images from "../constants/images";

const SharpDropdown2 = ({
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
      {title && title.trim() !== "" && (
        <Text style={styles.title}>{title}</Text>
      )}
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
        onChange={(item) => {
          setValue((prevValue) =>
            prevValue === item.value ? null : item.value
          );
          setIsFocus(false);
        }}
        renderRightIcon={() =>
          !isFocus && <Image source={images.arrowDown} style={styles.icon} />
        }
        containerStyle={styles.containerStyle}
        renderItem={(item) => (
          <TouchableOpacity
            style={[
              styles.listItem,
              item.value === value ? styles.listItemSelected : null,
            ]}
            onPress={() => {
              setValue((prevValue) =>
                prevValue === item.value ? null : item.value
              );
              setIsFocus(false);
            }}
          >
            <Text
              style={[
                styles.listItemText,
                item.value === value ? styles.listItemTextSelected : null,
              ]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default SharpDropdown2;

const styles = StyleSheet.create({
  dropdown: {
    height: 46,
    backgroundColor: "#FBF1E5",
    borderWidth: 2,
    borderColor: "#255586",
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  dropdownFocused: {
    borderColor: "#255586",
    borderWidth: 2,
  },
  placeholderStyle: {
    color: "#255586",
    textAlign: "center",
    fontFamily: "Arial",
  },
  selectedTextStyle: {
    fontSize: 18,
    color: "#255586",
    textAlign: "center",
    fontFamily: "SquadaOne",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    paddingHorizontal: 10,
    fontFamily: "SquadaOne",
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: "#666",
  },
  containerStyle: {
    backgroundColor: "#FBF1E5",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  listItem: {
    minHeight: 50,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#FBF1E5",
    justifyContent: "center",
  },
  listItemSelected: {
    backgroundColor: "#255586",
  },
  listItemText: {
    fontSize: 20,
    fontFamily: "SquadaOne",
    color: "#255586",
    height: 45,
    textAlignVertical: "center",
  },
  listItemTextSelected: {
    color: "#FBF1E5",
  },
});
