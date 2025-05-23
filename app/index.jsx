import React, { useEffect, useState } from "react";
import { StyleSheet, Text, Image, View, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SplashScreen from "expo-splash-screen";
import { FontProvider, useFontContext } from "../contexts/FontContext";
import theme from "../constants/theme";
import globalStyles from "../constants/globalStyles";
import images from "../constants/images";
import CustomButton from "../components/CustomButton";
import CustomModal from "../components/CustomModal";
import NetInfo from "@react-native-community/netinfo";

SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const { fontsReady } = useFontContext();
  const [appReady, setAppReady] = useState(false);
  const [isOfflineModalVisible, setIsOfflineModalVisible] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        if (!fontsReady) return;

        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          await SplashScreen.hideAsync();
          router.replace("/(tabs)/home");
          return;
        }

        if (Platform.OS === "web") {
          await SplashScreen.hideAsync();
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Error during app preparation:", error);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepareApp();
  }, [fontsReady]);

  const handleLoginPress = async () => {
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      setIsOfflineModalVisible(true);
      return;
    }
    router.push("/login");
  };

  const handleRegisterPress = async () => {
    const netInfoState = await NetInfo.fetch();
    if (!netInfoState.isConnected) {
      setIsOfflineModalVisible(true);
      return;
    }
    router.push("/signup");
  };

  const closeOfflineModal = () => {
    setIsOfflineModalVisible(false);
  };

  if (!appReady || !fontsReady) {
    return Platform.OS === "web" ? (
      <View
        style={[
          globalStyles.secondaryContainer,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ fontFamily: "system", fontSize: 18 }}>Loading...</Text>
      </View>
    ) : null;
  }

  return (
    <SafeAreaView style={[globalStyles.secondaryContainer, { padding: 0 }]}>
      <Text style={styles.header}>EVENTLOG</Text>
      <View style={styles.logoContainer}>
        <Image source={images.logo} style={styles.logo} />
      </View>
      <Text style={styles.tagline}>Every CIT Event's Companion</Text>

      <View style={styles.buttons}>
        <View style={styles.loginContainer}>
          <CustomButton
            type="primary"
            title="LOG IN"
            onPress={handleLoginPress}
          />
        </View>
        <CustomButton
          type="secondary"
          title="REGISTER"
          onPress={handleRegisterPress}
        />
      </View>
      <StatusBar style="auto" />

      <CustomModal
        visible={isOfflineModalVisible}
        title="No Internet Connection"
        message="Please check your internet connection and try again."
        type="error"
        onClose={closeOfflineModal}
      />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <FontProvider>
      <AppContent />
    </FontProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
    fontSize: theme.fontSizes.display,
    textAlign: "center",
    marginTop: 20,
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  logoContainer: {
    padding: 20,
  },
  tagline: {
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
    fontSize: theme.fontSizes.huge,
    textAlign: "center",
  },
  buttons: {
    paddingTop: 20,
    paddingHorizontal: 20,
    width: "70%",
  },
  loginContainer: {
    marginBottom: theme.spacing.medium,
    marginTop: theme.spacing.medium,
  },
});
