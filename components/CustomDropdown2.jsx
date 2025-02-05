import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import images from "../constants/images";

const CustomDropdown2 = ({ onSelect, title, placeholder, data }) => {
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    if (onSelect) {
      onSelect(value);
    }
  }, [value, onSelect]);

  return (
    <View style={styles.container}>
      <View style={styles.dropdownContainer}>
        <Text style={styles.title}>{title}</Text>
        <Dropdown
          style={[
            styles.dropdown,
            isFocus ? styles.focusedDropdown : styles.unfocusedDropdown,
          ]}
          placeholder={data.length > 0 ? placeholder : "No Events Available"}
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
            setValue(item.value);
            if (onSelect) onSelect(item.value);
          }}
          renderRightIcon={() =>
            isFocus ? null : (
              <Image source={images.arrowDown} style={styles.icon} />
            )
          }
          itemTextStyle={styles.itemText}
          selectedTextStyle={styles.selectedText}
          autoScroll={false}
          containerStyle={styles.containerStyle}
        />
      </View>
    </View>
  );
};

export default CustomDropdown2;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  dropdownContainer: {
    width: 311,
    height: 46,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "ArialBold",
    color: "#255586",
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
  containerStyle: {
    backgroundColor: "#FBF1E5",
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: "#707070",
  },
});
