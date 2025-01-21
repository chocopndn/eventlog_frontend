import { TextInput, View, Image, TouchableOpacity } from "react-native";
import React, { useState } from "react";

import images from "../constants/images.js";

const FormField = ({ type, placeholder, onChangeText, value }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (text) => {
    if (type === "id") {
      const filteredText = text.replace(/[^0-9]/g, "");
      onChangeText(filteredText);
    } else {
      onChangeText(text);
    }
  };

  return (
    <View>
      <View className="w-[311px] h-[46px] bg-secondary rounded-xl justify-center pl-3 m-5">
        <View className="items-center flex-row w-full">
          {type === "password" ? (
            <Image
              source={images.lock}
              className="h-[24px] w-[24px]"
              style={{ tintColor: "#333333" }}
            />
          ) : (
            <Image
              source={images.idBadge}
              className="h-[24px] w-[24px]"
              style={{ tintColor: "#333333" }}
            />
          )}

          <TextInput
            className="font-Arial text-[18px] flex-1 pl-2"
            placeholder={placeholder}
            value={value || ""}
            onChangeText={handleInputChange}
            secureTextEntry={type === "password" && !showPassword}
            selectionColor={isFocused ? "#000" : "transparent"}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType={type === "id" ? "numeric" : "default"}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {type === "password" && (
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="pr-2"
              style={{ tintColor: "#333333" }}
            >
              <Image
                source={showPassword ? images.view : images.hide}
                className="h-[24px] w-[24px]"
                style={{ tintColor: "#333333" }}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default FormField;
