import { View, SafeAreaView, Image } from "react-native";
import React from "react";
import QRCode from "react-native-qrcode-svg";

import images from "../../constants/images";

import CustomDropdown from "../../components/CustomDropdown";

const QRCodeScreen = () => {
  return (
    <SafeAreaView className="bg-secondary h-full items-center justify-center">
      <View className="relative w-[200px] h-[200px] border-primary border-[3px] items-center justify-center">
        <QRCode
          value="19015236"
          logoBackgroundColor="#FBF1E5"
          backgroundColor="transparent"
          size={190}
        />
        <View className="absolute bg-primary rounded-full p-1">
          <Image source={images.logo} className="w-[45px] h-[45px]" />
        </View>
      </View>
      <CustomDropdown
        title="Department"
        data={["event1", "event2"]}
        onSelect={""}
        placeholder="Select Department"
      />
    </SafeAreaView>
  );
};

export default QRCodeScreen;
