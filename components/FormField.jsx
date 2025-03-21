import {
  TextInput,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";

import theme from "../constants/theme.js";
import globalStyles from "../constants/globalStyles.js";
import images from "../constants/images.js";

const FormField = ({ type, placeholder, onChangeText, value }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (text) => {
    let formattedText = text;

    if (type === "id") {
      formattedText = text.replace(/[^0-9]/g, "");
    } else if (type === "password") {
      formattedText = text.replace(/\s/g, "");
    }

    onChangeText(formattedText);
  };

  const getIcon = () => {
    switch (type) {
      case "id":
        return images.idBadge;
      case "email":
        return images.email2;
      case "password":
        return images.lock;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {getIcon() && <Image source={getIcon()} style={globalStyles.icons} />}
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        value={value}
        onChangeText={handleInputChange}
        secureTextEntry={type === "password" && !showPassword}
        keyboardType={
          type === "id"
            ? "numeric"
            : type === "email"
            ? "email-address"
            : "default"
        }
        autoCapitalize="none"
        autoCorrect={false}
      />
      {type === "password" && (
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={showPassword ? images.view : images.hide}
            style={globalStyles.icons}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "80%",
    height: 46,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.secondary,
    flexDirection: "row",
    alignItems: "center",
    margin: theme.spacing.medium,
  },
  textInput: {
    fontFamily: "Arial",
    fontSize: theme.fontSizes.medium,
    flex: 1,
  },
});

export default FormField;
