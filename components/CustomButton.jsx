import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import React from "react";
import theme from "../constants/theme";

const CustomButton = ({
  type = "primary",
  title = "Button",
  onPress,
  otherStyles,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.buttonBase,
          type === "primary"
            ? styles.primary
            : type === "secondary"
            ? styles.secondary
            : styles.default,
          otherStyles,
        ]}
        onPress={onPress}
      >
        <Text
          style={[
            styles.text,
            type === "primary" ? styles.textPrimary : styles.textSecondary,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  buttonBase: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 46,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  default: {
    backgroundColor: "gray",
  },
  text: {
    fontFamily: "SquadaOne",
    fontSize: 30,
  },
  textPrimary: {
    color: theme.colors.secondary,
  },
  textSecondary: {
    color: theme.colors.primary,
  },
});

export default CustomButton;
