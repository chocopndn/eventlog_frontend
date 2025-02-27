import { View, Text, SafeAreaView, Image, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { getStoredUser, clearUser } from "../../database/queries";
import images from "../../constants/images";
import CustomButton from "../../components/CustomButton";

const Account = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const storedUser = await getStoredUser();
        setUser(storedUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await clearUser();
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SafeAreaView className="bg-secondary h-full">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View className="w-full items-center mt-24 mb-14">
          <View className="w-full h-50 items-center justify-center">
            <View className="absolute w-full h-28 bg-primary"></View>
            <View className="absolute w-[70%] h-10 bg-cyan-500 top-1/3 right-40"></View>
            <View className="absolute w-[70%] h-10 bg-cyan-500 bottom-1/3 left-40"></View>
            <View className="absolute w-[70%] h-10 bg-secondary"></View>

            <Image source={images.logo} style={{ width: 160, height: 160 }} />
          </View>

          <Text className="text-[60px] font-SquadaOne text-primary">
            Account
          </Text>

          {user ? (
            <View className="items-center">
              <Text className="text-[25px] text-primary font-ArialBold">
                {`${user.first_name} ${user.last_name}`}
              </Text>
              <Text className="text-[25px] text-primary font-ArialBold">
                {user.id_number}
              </Text>

              <View className="w-[300px]">
                <View className="border-2 border-primary p-2 border-b-0">
                  <Text className="text-[15px] font-ArialBold text-primary text-center">
                    Department
                  </Text>
                  <Text className="text-[15px] text-primary font-Arial text-center">
                    {user.department_name}
                  </Text>
                </View>

                <View className="border-2 border-primary p-2 border-b-0">
                  <Text className="text-[15px] font-ArialBold text-primary text-center">
                    Block
                  </Text>
                  <Text className="text-[15px] text-primary font-Arial text-center">
                    {user.block_name}
                  </Text>
                </View>

                <View className="border-2 border-primary p-2">
                  <Text className="text-[15px] font-ArialBold text-primary text-center">
                    Email
                  </Text>
                  <Text className="text-[15px] text-primary font-Arial text-center">
                    {user.email}
                  </Text>
                </View>
              </View>

              <View className="items-center w-full px-4 mt-4">
                <Text className="text-[15px] font-ArialBold text-primary">
                  Contact Us
                </Text>
                <View className="border-[1px] border-primary bg-primary w-[300px] my-2"></View>
                <Text className="text-center text-[15px] text-primary font-ArialBold">
                  UNIVERSITY OF CAGAYAN VALLEY COLLEGE OF INFORMATION TECHNOLOGY
                </Text>
                <Text className="text-center text-[15px] text-primary font-Arial mt-2">
                  VHNP Building 4th Floor - New Site Campus, Balzain, Tuguegarao
                  City, Cagayan
                </Text>
              </View>
              <View>
                <View className="flex-row mt-5">
                  <Image
                    source={images.email}
                    className="h-[24px] w-[24px] mr-2"
                  />
                  <Text className="font-Arial text-primary text-[15px]">
                    cit_eventlogsupport@gmail.com
                  </Text>
                </View>
                <View className="flex-row mt-5">
                  <Image
                    source={images.facebook}
                    className="h-[24px] w-[24px] mr-2"
                  />
                  <Text className="font-Arial text-primary text-[15px]">
                    CITofficial.ucv
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Text className="text-lg text-primary">Loading...</Text>
          )}

          <CustomButton
            title="Logout"
            type="primary"
            onPress={handleLogout}
            otherStyles="mt-5"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Account;
