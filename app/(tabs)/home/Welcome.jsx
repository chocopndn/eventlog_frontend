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
    <SafeAreaView className="items-center justify-center h-full bg-secondary pt-10">
      <View className="absolute top-10 left-5">
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

      <View className="items-center justify-center w-full">
        <View className="w-[85%] bg-primary items-center py-3 ">
          <Text className="text-secondary font-SquadaOne text-[25px]">
            WELCOME EVENTLOG USERS
          </Text>
        </View>

        <View className="w-[85%] bg-primary mt-3 h-[80%]">
          <View className="p-4 bg-primary rounded-lg">
            <View className="bg-secondary p-2 h-full">
              <Text className="font-SquadaOne text-[18px] text-primary mb-3">
                The College of Information Technology proudly introduces
                EVENTLOG, the new mobile application for event attendance
                monitoring. Designed to easily monitor and gather attendance for
                students in a modern way!
              </Text>

              <Text className="font-SquadaOne text-[18px] text-primary mb-3">
                EVENTLOG streamlines the attendance process, making it faster
                and more efficient. With the power of QR codes, you can now log
                in or out during events with just a quick scan.
              </Text>

              <Text className="font-SquadaOne text-[18px] text-primary mb-3">
                Join us in embracing this solution that enhances your event
                experience and simplifies attendance tracking. For more
                information or inquiries, feel free to contact us:
              </Text>

              <View>
                <View className="flex-row items-center mb-2">
                  <Image
                    source={images.email}
                    className="w-[24px] h-[24px] mr-2"
                  />
                  <Text className="font-SquadaOne text-[18px] text-primary">
                    cit_eventlogsupport@gmail.com
                  </Text>
                </View>

                <View className="flex-row items-center mb-2">
                  <Image
                    source={images.facebook}
                    className="w-[24px] h-[24px] mr-2"
                  />
                  <Text className="font-SquadaOne text-[18px] text-primary">
                    CITofficial.ucv
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Image
                    source={images.location}
                    className="w-[24px] h-[24px] mr-2"
                  />
                  <Text className="font-SquadaOne text-[18px] text-primary">
                    CIT Office - VHNP Building, 4th Floor
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;
