import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { View, Image, Text, StyleSheet } from "react-native";
import React from "react";

import images from "../../constants/images";
import theme from "../../constants/theme";

const TabsLayout = () => {
  return (
    <Tabs>
      <TabSlot />

      <TabList style={styles.tabList}>
        <TabTrigger name="Home" href="/(tabs)/home">
          <View style={styles.tabItem}>
            <Image source={images.home} style={styles.tabIcon} />
            <View style={styles.tabTextContainer}>
              <Text style={styles.tabText}>Home</Text>
            </View>
          </View>
        </TabTrigger>

        <TabTrigger name="QRCode" href="/(tabs)/QRCode">
          <View style={styles.tabItem}>
            <Image source={images.scanner} style={styles.tabIcon} />
            <View style={styles.tabTextContainer}>
              <Text style={styles.tabText}>QR Code</Text>
            </View>
          </View>
        </TabTrigger>

        <View style={styles.logoContainer}>
          <Image source={images.logo} style={styles.logoImage} />
        </View>

        <TabTrigger name="Records" href="/(tabs)/Records">
          <View style={styles.tabItem}>
            <Image source={images.calendar} style={styles.tabIcon} />
            <View style={styles.tabTextContainer}>
              <Text style={styles.tabText}>Records</Text>
            </View>
          </View>
        </TabTrigger>

        <TabTrigger name="Account" href="/(tabs)/Account">
          <View style={styles.tabItem}>
            <Image source={images.user} style={styles.tabIcon} />
            <View style={styles.tabTextContainer}>
              <Text style={styles.tabText}>Account</Text>
            </View>
          </View>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabList: {
    justifyContent: "space-around",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: theme.colors.primary,
    height: 70,
  },
  tabItem: {
    alignItems: "center",
  },
  tabIcon: {
    width: 24,
    height: 24,
    tintColor: theme.colors.secondary,
  },
  tabTextContainer: {
    width: 50,
    alignItems: "center",
  },
  tabText: {
    color: theme.colors.secondary,
    fontSize: theme.fontSizes.extraSmall,
    paddingTop: 4,
  },
  logoContainer: {
    position: "relative",
    bottom: 20,
    transform: [{ translateY: 0 }],
  },
  logoImage: {
    height: 100,
    width: 100,
    borderWidth: 6,
    borderColor: theme.colors.primary,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default TabsLayout;
