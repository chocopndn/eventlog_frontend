import { View, Text, SafeAreaView, Image, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { getStoredUser, clearUser } from "../../../database/queries";
import images from "../../../constants/images";
import CustomButton from "../../../components/CustomButton";

const AccountIndex = () => {
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
        <View className="w-full items-center mt-20 mb-14">
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
              <Text className="text-[25px] text-primary font-ArialBold pb-3">
                {`${user.first_name} ${user.last_name}`}
              </Text>

              {user.role_id === 1 || user.role_id === 2 ? (
                <Text className="text-[25px] font-ArialBold text-primary text-center pb-5">
                  {user.id_number}
                </Text>
              ) : (
                ""
              )}

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
                    {user.role_id === 1 || user.role_id === 2
                      ? "Block"
                      : "ID Number"}
                  </Text>
                  <Text className="text-[15px] text-primary font-Arial text-center">
                    {user.role_id === 1 || user.role_id === 2
                      ? user.block_name
                      : user.id_number}
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

              {!(user.role_id === 1 || user.role_id === 2) && (
                <View className="items-center mt-5">
                  <CustomButton
                    title="ADD EVENT"
                    type="primary"
                    onPress={() => {
                      router.push("/Account/AddEvent");
                    }}
                    otherStyles="h-[35px] w-[190px]"
                  />

                  <CustomButton
                    title="EDIT EVENT"
                    type="secondary"
                    onPress={() => {
                      router.push("/Account/EditEvent");
                    }}
                    otherStyles="h-[35px] w-[190px]"
                  />
                </View>
              )}

              <View className="items-center w-full px-4 mt-4">
                <Text className="text-[15px] font-ArialBold text-primary">
                  Contact Us
                </Text>
                <View className="border-[1px] border-primary bg-primary w-[300px] my-2"></View>
                <View>
                  <Text className="text-center text-[15px] text-primary font-ArialBold">
                    UNIVERSITY OF CAGAYAN VALLEY
                  </Text>
                  <Text className="text-center text-[15px] text-primary font-ArialBold">
                    COLLEGE OF INFORMATION TECHNOLOGY
                  </Text>
                </View>
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
            title="LOGOUT"
            type="primary"
            onPress={handleLogout}
            otherStyles="mt-5"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountIndex;
