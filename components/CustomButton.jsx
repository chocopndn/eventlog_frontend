import { Text, TouchableOpacity, View } from "react-native";
import React from "react";

export default function CustomButton({
  type = "primary",
  title = "Button",
  onPress,
}) {
  return (
    <TouchableOpacity
      className={`
       rounded-xl items-center justify-center m-3 w-60 h-[46px] ${
         type === "primary"
           ? "bg-primary"
           : type === "secondary"
           ? "bg-white border-primary border-[2px]"
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
  );
}
