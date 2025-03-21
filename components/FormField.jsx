import {
  TextInput,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Text,
} from "react-native";
import React, { useState, useRef } from "react";

import theme from "../constants/theme.js";
import globalStyles from "../constants/globalStyles.js";
import images from "../constants/images.js";

const FormField = ({ type, title, placeholder, onChangeText, value }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputs = useRef([]);

  const handleInputChange = (text, index) => {
    let formattedText = text;

    if (type === "id") {
      formattedText = text.replace(/[^0-9]/g, "");
    } else if (type === "password") {
      formattedText = text.replace(/\s/g, "");
    }

    if (type === "code") {
      if (text.length > 1) return;

      const newCode = [...value];
      newCode[index] = text;
      onChangeText(newCode);

      if (text && index < value.length - 1) {
        inputs.current[index + 1]?.focus();
      }
    } else {
      onChangeText(formattedText);
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
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

  return type === "code" ? (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.codeContainer}>
        {value.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={styles.codeInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleInputChange(text, index)}
            onKeyPress={(event) => handleKeyPress(event, index)}
            autoFocus={index === 0}
          />
        ))}
      </View>
    </View>
  ) : (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.inputWrapper}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "80%",
    marginBottom: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.small,
    fontFamily: "Arial",
  },
  inputWrapper: {
    width: "100%",
    height: 46,
    paddingHorizontal: 10,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.secondary,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    fontFamily: "Arial",
    fontSize: theme.fontSizes.medium,
    flex: 1,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.spacing.small,
  },
  codeInput: {
    width: 50,
    height: 60,
    textAlign: "center",
    fontSize: theme.fontSizes.huge,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
    backgroundColor: theme.colors.secondary,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 8,
  },
});

export default FormField;
