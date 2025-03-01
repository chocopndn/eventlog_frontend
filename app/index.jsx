import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import images from "../constants/images";
import { setupDatabase, initDB } from "../database/database";

import CustomButton from "../components/CustomButton";

const App = () => {
  const [loading, setLoading] = useState(true);
  const [db, setDb] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await setupDatabase();
        const initializedDb = await initDB();
        setDb(initializedDb);

        const authToken = await AsyncStorage.getItem("authToken");
        if (authToken) {
          router.replace("/home");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Database initialization error:", error);
      }
    };

    initialize();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-secondary">
        <ActivityIndicator size="large" color="#81b0ff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="items-center justify-center h-full bg-secondary">
      <Text className="text-[80px] font-SquadaOne color-primary">EVENTLOG</Text>
      <View className="mt-5 mb-7">
        <Image source={images.logo} className="w-[196px] h-[196px]" />
      </View>
      <Text className="font-SquadaOne color-primary text-[30px]">
        Every CIT Event's Companion
      </Text>

      <View className="mt-5" pointerEvents="box-none">
        <CustomButton
          type="primary"
          title="LOG IN"
          onPress={() => router.push("./login")}
        />
        <CustomButton
          type="secondary"
          title="REGISTER"
          onPress={() => router.push("/SignUp")}
        />
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default App;
