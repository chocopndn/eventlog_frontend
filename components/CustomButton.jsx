import { Pressable, Text, TouchableOpacity, View } from "react-native";
import React from "react";

const CustomButton = ({
  type = "primary",
  title = "Button",
  onPress,
  otherStyles,
}) => {
  return (
    <View>
      <TouchableOpacity
        className={`
      ${otherStyles} rounded-xl items-center justify-center m-3 w-[228px] h-[46px] ${
          type === "primary"
            ? "bg-primary"
            : type === "secondary"
            ? "bg-secondary border-primary border-[2px]"
            : "bg-gray-400"
        }
       
    `}
        onPress={onPress}
      >
        <Text
          className={`font-SquadaOne text-[30px]
      ${
        type === "primary"
          ? "text-secondary"
          : type === "secondary"
          ? "color-primary"
          : "color-primary"
      }
    `}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomButton;
