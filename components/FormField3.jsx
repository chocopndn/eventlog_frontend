import { View, Text, TextInput } from "react-native";
import React from "react";

const FormField3 = ({ onChangeText, value, containerHeight }) => {
  return (
    <View
      className="border-2 border-primary"
      style={{ height: containerHeight }}
    >
      <TextInput
        value={value || ""}
        onChangeText={onChangeText}
        style={{ flex: 1, textAlignVertical: "top" }}
        multiline={true}
      />
    </View>
  );
};

export default FormField3;
