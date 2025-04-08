import { StyleSheet, View, Image, Text } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import QRCode from "react-native-qrcode-svg";
import CustomDropdown from "../../../../components/CustomDropdown";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import images from "../../../../constants/images";

const Generate = () => {
  return (
    <View style={globalStyles.secondaryContainer}>
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
      <View style={styles.dropdownContainer}>
        <CustomDropdown
          display="sharp"
          fontFamily={theme.fontFamily.SquadaOne}
          placeholder="SELECT EVENT"
          placeholderFontSize={theme.fontSizes.large}
          placeholderColor={theme.colors.primary}
        />
      </View>
      <View style={styles.userDetailsContainer}>
        <Text style={styles.userDetails}>Mina, Dhanrev S.</Text>
        <Text style={styles.userDetails}>ID: 19015236</Text>
        <Text style={styles.userDetails}>Course: BSIT</Text>
        <Text style={styles.userDetails}>Block: 3A NON</Text>
      </View>
      <View style={styles.noteContainer}>
        <Text style={styles.note}>
          NOTE: The instructors/Officers in-charged will scan your QR Code.
          Approach them immediately.
        </Text>
      </View>
      <StatusBar style="light" />
    </View>
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
  dropdownContainer: {
    width: "80%",
    marginTop: theme.spacing.large,
  },
  userDetails: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.large,
    padding: theme.spacing.xsmall,
  },
  userDetailsContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: theme.colors.primary,
    width: "80%",
    padding: theme.spacing.small,
    borderColor: theme.colors.primary,
  },
  noteContainer: {
    width: "80%",
    marginTop: theme.spacing.large,
    padding: theme.spacing.small,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  note: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
  },
});
