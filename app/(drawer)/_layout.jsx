import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router, usePathname } from "expo-router";
import { StyleSheet, View, Text, Image, Dimensions } from "react-native";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { getRoleID } from "../../database/queries";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import images from "../../constants/images";
import theme from "../../constants/theme";

const screenWidth = Dimensions.get("window").width;

const CustomDrawerContent = (props) => {
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

  if (roleId !== 4) {
    return (
      <View style={styles.noAccessContainer}>
        <Text style={styles.noAccessText}>No Access</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("id_number");
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <DrawerItem
          label="Home"
          onPress={() => router.push("/(drawer)/(tabs)/home")}
          labelStyle={styles.navItemLabel}
          icon={() => <Image source={images.home} style={styles.icon} />}
        />
        <DrawerItem
          label="Admins"
          onPress={() => router.push("/(drawer)/admins")}
          labelStyle={styles.navItemLabel}
          icon={() => <Image source={images.admin} style={styles.icon} />}
        />
        <DrawerItem
          label="Courses"
          onPress={() => router.push("/(drawer)/courses")}
          labelStyle={styles.navItemLabel}
          icon={() => <Image source={images.course} style={styles.icon} />}
        />
        <DrawerItem
          label="Departments"
          onPress={() => router.push("/(drawer)/departments")}
          labelStyle={styles.navItemLabel}
          icon={() => <Image source={images.department} style={styles.icon} />}
        />
        <DrawerItem
          label="Events"
          onPress={() => router.push("/(drawer)/events")}
          labelStyle={styles.navItemLabel}
          icon={() => <Image source={images.event} style={styles.icon} />}
        />
        <DrawerItem
          label="Records"
          onPress={() => router.push("/(drawer)/records")}
          labelStyle={styles.navItemLabel}
          icon={() => <Image source={images.calendar} style={styles.icon} />}
        />
        <DrawerItem
          label="Roles"
          onPress={() => router.push("/(drawer)/roles")}
          labelStyle={styles.navItemLabel}
          icon={() => <Image source={images.role} style={styles.icon} />}
        />
        <DrawerItem
          label="Students"
          onPress={() => router.push("/(drawer)/students")}
          labelStyle={styles.navItemLabel}
          icon={() => <Image source={images.student} style={styles.icon} />}
        />
      </View>
      <View>
        <DrawerItem
          label="Account"
          onPress={() => router.push("/(drawer)/account")}
          labelStyle={styles.navItemLabel}
          icon={() => <Image source={images.user} style={styles.icon} />}
        />
        <DrawerItem
          label="Logout"
          onPress={handleLogout}
          labelStyle={[styles.navItemLabel, { color: "red" }]}
          icon={() => (
            <Image
              source={images.logout}
              style={[styles.icon, { tintColor: "red" }]}
            />
          )}
        />
      </View>
    </DrawerContentScrollView>
  );
};

export default function DrawerLayout() {
  const pathName = usePathname();
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

  if (roleId !== 4) {
    return (
      <Drawer
        drawerContent={() => (
          <View style={styles.noAccessContainer}>
            <Text style={styles.noAccessText}>No Access</Text>
          </View>
        )}
        screenOptions={{
          drawerPosition: "locked-closed",
          swipeEnabled: false,
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Drawer>
    );
  }

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerLeft: () => <DrawerToggleButton />,
        drawerStyle: {
          backgroundColor: theme.colors.secondary,
          width: screenWidth * 0.8,
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: pathName === "/home" ? "Home" : "QRCode",
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: theme.colors.secondary,
        }}
      />
      <Drawer.Screen
        name="admins"
        options={{
          headerTitle: "Admins",
        }}
      />
      <Drawer.Screen
        name="courses"
        options={{
          headerTitle: "Courses",
        }}
      />
      <Drawer.Screen
        name="departments"
        options={{
          headerTitle: "Departments",
        }}
      />
      <Drawer.Screen
        name="events"
        options={{
          headerTitle: "Events",
        }}
      />
      <Drawer.Screen
        name="records"
        options={{
          headerTitle: "Records",
        }}
      />
      <Drawer.Screen
        name="roles"
        options={{
          headerTitle: "Roles",
        }}
      />
      <Drawer.Screen
        name="students"
        options={{
          headerTitle: "Students",
        }}
      />
      <Drawer.Screen
        name="account"
        options={{
          headerTitle: "Account",
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  noAccessContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noAccessText: {
    fontSize: 18,
    color: "red",
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: theme.colors.primary,
  },
  navItemLabel: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
  },
});
