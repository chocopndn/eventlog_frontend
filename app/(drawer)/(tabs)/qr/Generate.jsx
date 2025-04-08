import { StyleSheet, View, Image } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import QRCode from "react-native-qrcode-svg";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import images from "../../../../constants/images";

const Generate = () => {
  return (
    <SafeAreaView style={globalStyles.secondaryContainer}>
      <View style={styles.container}>
        <View style={styles.qrCodeContainer}>
          <QRCode
            value="{firstname+lastname} + idnumber + eventid"
            backgroundColor={theme.colors.secondary}
            size={200}
          />
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Image source={images.logo} style={styles.logo} />
            </View>
          </View>
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default Generate;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  qrCodeContainer: {
    position: "relative",
    width: 220,
    height: 220,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  logoBackground: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 50,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
});
