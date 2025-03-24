import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router, usePathname } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { DrawerToggleButton } from "@react-navigation/drawer";
import { getRoleID } from "../../database/queries";
import { useEffect, useState } from "react";

const CustomDrawerContent = (props) => {
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
      <View style={styles.noAccessContainer}>
        <Text style={styles.noAccessText}>No Access</Text>
      </View>
    );
  }

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Home"
        labelStyle={[
          styles.navItemLabel,
          { color: pathName === "/(drawer)/(tabs)/home" ? "#fff" : "#000" },
        ]}
        onPress={() => router.push("/(drawer)/(tabs)/home")}
      />
      <DrawerItem
        label="Admins"
        labelStyle={[
          styles.navItemLabel,
          { color: pathName === "/(drawer)/admins" ? "#fff" : "#000" },
        ]}
        onPress={() => router.push("/(drawer)/admins")}
      />
      <DrawerItem
        label="Courses"
        labelStyle={[
          styles.navItemLabel,
          { color: pathName === "/(drawer)/courses" ? "#fff" : "#000" },
        ]}
        onPress={() => router.push("/(drawer)/courses")}
      />
    </DrawerContentScrollView>
  );
};

export default function DrawerLayout() {
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
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: "Home",
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
    </Drawer>
  );
}

const styles = StyleSheet.create({
  navItemLabel: {
    marginLeft: -20,
    fontSize: 18,
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noAccessText: {
    fontSize: 18,
    color: "red",
  },
});
