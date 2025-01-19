import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import images from "../constants/images";

const CustomDropdown = ({ onSelect, title, data, placeholder }) => {
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    if (onSelect) {
      onSelect(value);
    }
  }, [value, onSelect]);

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
          placeholder={[isFocus ? placeholder : ""]}
          placeholderStyle={
            isFocus ? styles.focusedPlaceholder : styles.unfocusedPlaceholder
          }
          data={data}
          labelField="label"
          valueField="value"
          maxHeight={300}
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={(item) => {
            if (item.value === value) {
              setValue(null);
            } else {
              setValue(item.value);
            }
          }}
          itemContainerStyle={styles.itemContainerStyle}
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
        />
      </View>
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  dropdownContainer: {
    width: 311,
    height: 46,
    justifyContent: "center",
  },
  dropdown: {
    height: 46,
    paddingHorizontal: 8,
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
  itemContainerStyle: {
    backgroundColor: "#FBF1E5",
  },
  focusedPlaceholder: {
    paddingTop: 2,
    backgroundColor: "#255586",
    color: "#FBF1E5",
    textAlign: "center",
    justifyContent: "center",
    fontFamily: "ArialBold",
    height: 30,
    fontSize: 18,
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
});
