import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { View, Image, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { DrawerToggleButton } from "@react-navigation/drawer";

import { getRoleID } from "../../../database/queries";

import images from "../../../constants/images";
import theme from "../../../constants/theme";

const TabsLayout = () => {
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    const fetchRoleId = async () => {
      try {
        const fetchedRoleId = await getRoleID();
        setRoleId(fetchedRoleId);
      } catch (error) {
        console.error("Error fetching role ID:", error);
      }
    };

    fetchRoleId();
  }, []);

  return roleId !== 4 ? (
    <Tabs>
      <TabSlot
        screenOptions={{
          headerLeft: () => <DrawerToggleButton tintColor="#000" />,
        }}
      />

      <TabList style={styles.tabList}>
        <TabTrigger name="Home" href="/(tabs)/home">
          <View style={styles.tabItem}>
            <Image source={images.home} style={styles.tabIcon} />
            <Text style={styles.tabText}>Home</Text>
          </View>
        </TabTrigger>

        <TabTrigger name="QRCode" href="/(tabs)/QRCode">
          <View style={styles.tabItem}>
            <Image source={images.scanner} style={styles.tabIcon} />
            <Text style={styles.tabText}>QR Code</Text>
          </View>
        </TabTrigger>

        <View style={styles.logoContainer}>
          <Image source={images.logo} style={styles.logoImage} />
        </View>

        <TabTrigger name="Records" href="/(tabs)/Records">
          <View style={styles.tabItem}>
            <Image source={images.calendar} style={styles.tabIcon} />
            <Text style={styles.tabText}>Records</Text>
          </View>
        </TabTrigger>

        <TabTrigger name="Accounts" href="/(tabs)/Accounts">
          <View style={styles.tabItem}>
            <Image source={images.user} style={styles.tabIcon} />
            <Text style={styles.tabText}>Account</Text>
          </View>
        </TabTrigger>
      </TabList>
    </Tabs>
  ) : (
    <Tabs>
      <TabSlot
        screenOptions={{
          headerLeft: () => <DrawerToggleButton tintColor="#000" />,
        }}
      />

      <TabList style={styles.tabList}>
        <TabTrigger name="Home" href="/(tabs)/home">
          <View style={styles.tabItem}>
            <Image source={images.home} style={styles.tabIcon} />
            <Text style={styles.tabText}>Home</Text>
          </View>
        </TabTrigger>

        <View style={styles.logoContainer}>
          <Image source={images.logo} style={styles.logoImage} />
        </View>

        <TabTrigger name="QRCode" href="/(tabs)/QRCode">
          <View style={styles.tabItem}>
            <Image source={images.scanner} style={styles.tabIcon} />
            <Text style={styles.tabText}>QR Code</Text>
          </View>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabList: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});

export default TabsLayout;
