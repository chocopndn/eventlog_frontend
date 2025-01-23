import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { View, Image, Text, TouchableOpacity } from "react-native";
import React from "react";

import images from "../../constants/images";

const TabsLayout = () => {
  return (
    <Tabs>
      <TabSlot />

      <TabList className="flex-row justify-around items-center pl-3 pr-3 bg-primary h-20">
        <TabTrigger name="Home" href="/(tabs)/home">
          <View className="items-center">
            <Image
              source={images.home}
              className="h-8 w-8"
              style={{ tintColor: "#FBF1E5" }}
            />
            <View className="w-12 items-center">
              <Text className="color-secondary text-xs pt-1">Home</Text>
            </View>
          </View>
        </TabTrigger>

        <TabTrigger name="QRCode" href="/(tabs)/QRCode">
          <View className="items-center">
            <Image
              source={images.scanner}
              className="h-8 w-8"
              style={{ tintColor: "#FBF1E5" }}
            />
            <View className="w-12">
              <Text className="color-secondary text-xs pt-1">QR Code</Text>
            </View>
          </View>
        </TabTrigger>

        <View className="relative bottom-5 transform">
          <Image
            source={images.logo}
            className="h-[100px] w-[100px] border-primary rounded-full border-[6px] shadow-2xl"
          />
        </View>

        <TabTrigger name="Records" href="/(tabs)/Records">
          <View className="items-center">
            <Image
              source={images.calendar}
              className="h-8 w-8"
              style={{ tintColor: "#FBF1E5" }}
            />
            <View className="w-12">
              <Text className="color-secondary text-xs  pt-1">Records</Text>
            </View>
          </View>
        </TabTrigger>

        <TabTrigger name="Account" href="/(tabs)/Account">
          <View className="items-center">
            <Image
              source={images.user}
              className="h-8 w-8"
              style={{ tintColor: "#FBF1E5" }}
            />
            <View className="w-12">
              <Text className="color-secondary text-xs pt-1">Account</Text>
            </View>
          </View>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
};

export default TabsLayout;
