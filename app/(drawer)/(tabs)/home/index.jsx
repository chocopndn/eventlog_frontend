import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import CollapsibleDropdown from "../../../../components/CollapsibleDropdown";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

const Home = () => {
  return (
    <SafeAreaView style={globalStyles.secondaryContainer}>
      <View>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.textHeader}>EVENTLOG</Text>
          <Text style={styles.title}>LIST OF EVENTS</Text>
          <View style={styles.line}></View>
        </View>
        <TouchableOpacity onPress={() => router.push("/home/Welcome")}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>WELCOME EVENTLOG USERS!</Text>
          </View>
        </TouchableOpacity>
        <ScrollView
          style={{ marginBottom: 20 }}
          contentContainerStyle={styles.scrollview}
          showsVerticalScrollIndicator={false}
        >
          <CollapsibleDropdown
            title="Foundation Day"
            date="October 22, 2025"
            venue="VHNPB Building"
            am_in="6:30-7:30"
            am_out="11:00-12:00"
            pm_in="12:00-1:00"
            pm_out="5:00-6:00"
            personnel="Year Level Representatives, Governor, or Year Level Adviser"
          />
        </ScrollView>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  textHeader: {
    fontSize: theme.fontSizes.display,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
    paddingBottom: theme.spacing.large,
  },
  title: {
    fontSize: theme.fontSizes.huge,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
  },
  line: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
    width: "100%",
    height: 2,
  },
  welcomeContainer: {
    height: 50,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginTop: theme.spacing.large,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontFamily: "SquadaOne",
    fontSize: theme.fontSizes.large,
    color: theme.colors.primary,
  },
  scrollview: {
    marginTop: 20,
    width: "100%",
    paddingBottom: 20,
  },
});
