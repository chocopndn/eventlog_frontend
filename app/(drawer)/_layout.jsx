import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { router, usePathname } from "expo-router";
import { StyleSheet } from "react-native";

const CustomDrawerContent = (props) => {
  const pathName = usePathname();

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Home"
        labelStyle={[
          styles.navItemLabel,
          { color: pathName === "/(drawer)/(tabs)/home" ? "#fff" : "#000" },
        ]}
        onPress={() => router.push(`/(drawer)/(tabs)/home`)}
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
  const pathName = usePathname();
  return (
    <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="(tabs)"
        options={{
          headerTitle: `${pathName}`,
        }}
      />
      <Drawer.Screen name="courses" options={{ headerTitle: "Courses" }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  navItemLabel: {
    marginLeft: -20,
    fontSize: 18,
  },
});
