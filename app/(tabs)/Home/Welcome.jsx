import {
  Text,
  SafeAreaView,
  Image,
  View,
  TouchableOpacity,
} from "react-native";
import React from "react";

import images from "../../../constants/images";
import { router } from "expo-router";

const handleDismissAll = () => {
  router.dismissAll();
};

const Welcome = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center h-full bg-secondary pt-5">
      <View className="p-5 absolute top-5 justify-start w-full">
        <TouchableOpacity onPress={handleDismissAll}>
          <View className="w-[40px] h-[40px] items-center justify-center border-[3px] border-primary rounded-full">
            <Image
              source={images.arrowLeft}
              className="w-[24px] h-[24px]"
              style={{ tintColor: "#255586" }}
            />
          </View>
        </TouchableOpacity>
      </View>

      <View className="w-full justify-center items-center h-[90%] mt-12">
        <View className="w-[327px] bg-primary items-center justify-center">
          <Text className="color-secondary font-SquadaOne text-[25px] m-3">
            WELCOME EVENTLOG USERS
          </Text>
        </View>
        <View className="w-[327px] h-[83%] bg-primary items-center justify-center mt-1">
          <View className="w-[90%] p-2 bg-secondary items-start justify-center">
            <Text className="font-SquadaOne text-[18px] color-primary p-3 pt-0">
              The College of Information Technology proudly introduce EVENTLOG,
              the new mobile application - event attendance monitoring system,
              designed to easily monitor and gather the attendance of each
              student in a techy-way!
            </Text>
            <Text className="font-SquadaOne text-[18px] color-primary p-3">
              EVENTLOG streamlines the attendance process, making it faster,
              more efficient, and friendly. With the power of QR codes, you can
              now easily log in/out your attendance during events with just a
              quick scan.
            </Text>
            <Text className="font-SquadaOne text-[18px] color-primary p-3">
              Join us in embracing this innovative solution that enhances your
              event experience and simplifies attendance logging. Welcome and
              happy logging! For more information/inquiries feel free to contact
              us:
            </Text>

            <View>
              <View className="flex-row items-center pl-3">
                <Image
                  source={images.email}
                  className="w-[24px] h-[24px] mr-2"
                />
                <Text className="font-SquadaOne text-[18px] color-primary">
                  cit_eventlogsupport@gmail.com
                </Text>
              </View>

              <View className="flex-row items-center pl-3 pt-2">
                <Image
                  source={images.facebook}
                  className="w-[24px] h-[24px] mr-2"
                />
                <Text className="font-SquadaOne text-[18px] color-primary">
                  CITofficial.ucv
                </Text>
              </View>

              <View className="flex-row items-center pl-3 pt-2">
                <Image
                  source={images.location}
                  className="w-[24px] h-[24px] mr-2"
                />
                <Text className="font-SquadaOne text-[18px] color-primary">
                  CIT Office - VHNP Building 4th Floor
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
