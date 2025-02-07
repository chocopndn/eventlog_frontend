import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import images from "../constants/images";

const CustomDropdown = ({ onSelect, title, data, placeholder, value }) => {
  const [selectedValue, setSelectedValue] = useState(value);
  const [isFocus, setIsFocus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleChange = (item) => {
    if (errorMessage) setErrorMessage("");

    const isValid = onSelect ? onSelect(item.value) : true;

    if (isValid !== false) {
      setSelectedValue(item.value);
    } else {
      setErrorMessage("Invalid selection. Please choose again.");
    }
  };

  return (
    <View className="p-4">
      <View style={styles.dropdownContainer}>
        <Text className="color-secondary font-ArialBold text-[18px]">
          {title}
        </Text>
        <Dropdown
          style={[
            styles.dropdown,
            isFocus ? styles.focusedDropdown : styles.unfocusedDropdown,
          ]}
          placeholder={placeholder || "Select an option"}
          placeholderStyle={styles.placeholderStyle}
          data={data}
          labelField="label"
          valueField="value"
          maxHeight={300}
          value={selectedValue}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={handleChange}
          renderRightIcon={() =>
            isFocus ? null : (
              <Image
                source={images.arrowDown}
                className="w-[24px] h-[24px]"
                style={{ tintColor: "#707070" }}
              />
            )
          }
          itemTextStyle={styles.itemText}
          selectedTextStyle={styles.selectedText}
          autoScroll={false}
          containerStyle={styles.containerStyle}
        />
        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}
      </View>
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  dropdownContainer: {
    width: 311,
    height: 60,
    justifyContent: "center",
  },
  dropdown: {
    height: 46,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontFamily: "ArialBold",
    fontSize: 16,
    color: "#707070",
  },
  unfocusedDropdown: {
    backgroundColor: "#FBF1E5",
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: 12,
  },
  focusedDropdown: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: "#FBF1E5",
  },
  itemText: {
    fontFamily: "ArialBold",
    color: "#255586",
    textAlign: "center",
  },
  selectedText: {
    fontFamily: "Arial",
    fontSize: 18,
  },
  containerStyle: {
    backgroundColor: "#FBF1E5",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
    fontFamily: "Arial",
  },
});
