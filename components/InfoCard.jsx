import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import images from "../constants/images";

const InfoCard = ({ title, name, id_number, course, block, onTitlePress }) => {
  return (
    <View className="w-full flex items-center">
      <Pressable
        className="flex-row justify-between items-center p-3 bg-[#FBF1E5] border-primary border-2 w-[260px] h-[50px]"
        onPress={onTitlePress}
      >
        <View>
          <Text className="text-[20px] text-primary font-SquadaOne">
            {title}
          </Text>
        </View>
        <Image
          source={images.arrowDown}
          className="w-[24px] h-[24px]"
          style={{ tintColor: "#707070" }}
        />
      </Pressable>

      <View className="bg-secondary border-2 border-t-0 border-primary w-[260px] flex items-center">
        <View className="justify-center items-center py-3 px-4">
          <View className="flex-row">
            <Text className="text-[20px] text-primary font-SquadaOne">
              {name || "N/A"}
            </Text>
          </View>

          <View className="flex-row mt-2">
            <Text className="text-[20px] text-primary font-SquadaOne">
              {"ID: "}
            </Text>
            <Text className="text-[20px] text-primary font-SquadaOne">
              {id_number || "N/A"}
            </Text>
          </View>

          <View className="flex-row mt-2">
            <Text className="text-[20px] text-primary font-SquadaOne">
              {"COURSE: "}
            </Text>
            <Text className="text-[20px] text-primary font-SquadaOne">
              {course || "N/A"}
            </Text>
          </View>

          <View className="flex-row mt-2">
            <Text className="text-[20px] text-primary font-SquadaOne">
              {"BLOCK: "}
            </Text>
            <Text className="text-[20px] text-primary font-SquadaOne">
              {block || "N/A"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default InfoCard;
