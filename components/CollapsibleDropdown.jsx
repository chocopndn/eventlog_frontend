import React, { useState, useRef } from "react";
import { View, Text, Animated, Image, Pressable } from "react-native";
import images from "../constants/images";

const CollapsibleDropdown = ({
  title,
  date,
  venue,
  morningIn,
  afternoonIn,
  morningOut,
  afternoonOut,
  personnel,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animationController = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    if (isExpanded) {
      Animated.timing(animationController, {
        duration: 300,
        toValue: 0,
        useNativeDriver: false,
      }).start(() => setIsExpanded(false));
    } else {
      setIsExpanded(true);
      Animated.timing(animationController, {
        duration: 300,
        toValue: 1,
        useNativeDriver: false,
      }).start();
    }
  };

  const animatedHeight = animationController.interpolate({
    inputRange: [0, 1],
    outputRange: [
      0,
      (morningIn || morningOut) && (afternoonIn || afternoonOut) ? 200 : 180,
    ],
  });

  return (
    <View className="w-full mb-3">
      <Pressable
        className="flex-row justify-between items-center p-4 bg-[#FBF1E5] border-primary border-2 w-[303px] h-[52px]"
        onPress={toggleDropdown}
      >
        <View>
          <Text className="text-[20px] text-primary font-SquadaOne">
            {title}
          </Text>
          <Text className="text-[12px] text-primary font-SquadaOne pt-1">
            {date}
          </Text>
        </View>
        <Image
          source={isExpanded ? images.arrowUp : images.arrowDown}
          className="w-[24px] h-[24px]"
          style={{ tintColor: "#707070" }}
        />
      </Pressable>

      <Animated.View
        style={{
          height: animatedHeight,
          overflow: "hidden",
        }}
        className="bg-secondary border-2 border-t-0 border-primary w-[303px] justify-center items-center"
      >
        <View className="justify-center p-3">
          <Text className="text-[15px] text-primary font-ArialBold">
            VENUE OF TIME IN/OUT:
          </Text>
          <Text className="text-[12px] text-primary font-Arial">{venue}</Text>

          {(morningIn || morningOut || afternoonIn || afternoonOut) && (
            <View className="items-center justify-between flex-row pt-2">
              {(morningIn || morningOut) && (
                <View>
                  <Text className="font-ArialBold text-[15px] color-primary">
                    TIME IN:
                  </Text>
                  {morningIn && (
                    <View className="flex-row">
                      <Text className="font-ArialBold text-[12px] color-primary">
                        Morning:{" "}
                      </Text>
                      <Text className="font-Arial text-[12px] color-primary">
                        {morningIn}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {(morningOut || afternoonOut) && (
                <View>
                  <Text className="font-ArialBold text-[15px] color-primary">
                    TIME OUT:
                  </Text>
                  {morningOut && (
                    <View className="flex-row">
                      <Text className="font-ArialBold text-[12px] color-primary">
                        Morning:{" "}
                      </Text>
                      <Text className="font-Arial text-[12px] color-primary">
                        {morningOut}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {(afternoonIn || afternoonOut) && (
            <View className="items-center justify-between flex-row pt-2">
              {afternoonIn && (
                <View>
                  <Text className="font-ArialBold text-[15px] color-primary">
                    TIME IN:
                  </Text>
                  <View className="flex-row">
                    <Text className="font-ArialBold text-[12px] color-primary">
                      Afternoon:{" "}
                    </Text>
                    <Text className="font-Arial text-[12px] color-primary">
                      {afternoonIn}
                    </Text>
                  </View>
                </View>
              )}
              {afternoonOut && (
                <View>
                  <Text className="font-ArialBold text-[15px] color-primary">
                    TIME OUT:
                  </Text>{" "}
                  <View className="flex-row">
                    <Text className="font-ArialBold text-[12px] color-primary">
                      Afternoon:{" "}
                    </Text>
                    <Text className="font-Arial text-[12px] color-primary">
                      {afternoonOut}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          <View className="pt-2">
            <Text className="font-ArialBold text-[15px] color-primary">
              SCAN PERSONNEL:
            </Text>
            <Text className="font-Arial text-[12px] color-primary">
              {personnel}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default CollapsibleDropdown;
