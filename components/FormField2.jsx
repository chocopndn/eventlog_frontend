import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";

import images from "../constants/images";

const FormField2 = ({ type, title, onChangeText, value, sample }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (text) => {
    if (title === "ID Number") {
      const filteredText = text.replace(/[^0-9]/g, "");
      onChangeText(filteredText);
    } else {
      onChangeText(text);
    }
  };

  return (
    <View className="p-2">
      <Text className="color-secondary font-ArialBold text-[18px]">
        {title}{" "}
        {sample ? (
          <Text className="color-secondary font-ArialItalic text-[12px]">{`(Ex. ${sample})`}</Text>
        ) : (
          <Text></Text>
        )}
      </Text>
      <View className="w-[311px] h-[46px] bg-secondary rounded-xl flex-row items-center">
        <TextInput
          className="font-Arial text-[18px] flex-1 pl-2"
          value={value || ""}
          onChangeText={handleInputChange}
          secureTextEntry={type === "password" && !showPassword}
          selectionColor={isFocused ? "#000" : "transparent"}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={title === "ID Number" ? "numeric" : "default"}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {type === "password" && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="pr-2"
          >
            <Image
              source={showPassword ? images.view : images.hide}
              className="h-[24px] w-[24px]"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField2;