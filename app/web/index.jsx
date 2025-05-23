import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";

import theme from "../../constants/theme";
import globalStyles from "../../constants/globalStyles";
import WebHeader from "../../components/WebHeader";
import CustomSearch from "../../components/CustomSearch";
import images from "../../constants/images";
import { router } from "expo-router";

const Web = () => {
  return (
    <View
      style={[
        globalStyles.secondaryContainer,
        { padding: 0, justifyContent: "flex-start" },
      ]}
    >
      <WebHeader title="ATTENDANCE RECORD" />
      <View style={styles.searchContainer}>
        <CustomSearch />
      </View>

      <ScrollView
        style={{ width: "90%" }}
        contentContainerStyle={styles.scrollView}
      >
        <Text style={[styles.title, { marginTop: theme.spacing.large }]}>
          ONGOING EVENTS
        </Text>
        <View style={styles.eventWrapper}>
          <TouchableOpacity
            style={styles.eventContainer}
            onPress={() => {
              router.push("web/Records");
            }}
          >
            <Image source={images.calendar} style={styles.icon} />
            <Text style={styles.dateTitle}>
              January 15, 2025 - Microsoft Office Seminar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.eventContainer, { marginLeft: 10 }]}
            onPress={() => {
              router.push("web/Records");
            }}
          >
            <Image source={images.calendar} style={styles.icon} />
            <Text style={styles.dateTitle}>
              January 15, 2025 - Microsoft Office Seminar
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { marginTop: theme.spacing.xlarge }]}>
          PAST EVENTS
        </Text>
        <View style={styles.eventWrapper}>
          <TouchableOpacity
            style={styles.eventContainer}
            onPress={() => {
              router.push("web/Records");
            }}
          >
            <Image source={images.calendar} style={styles.icon} />
            <Text style={styles.dateTitle}>
              January 15, 2025 - Microsoft Office Seminar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.eventContainer, { marginLeft: 10 }]}
            onPress={() => {
              router.push("web/Records");
            }}
          >
            <Image source={images.calendar} style={styles.icon} />
            <Text style={styles.dateTitle}>
              January 15, 2025 - Microsoft Office Seminar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Web;

const styles = StyleSheet.create({
  searchContainer: {
    width: "90%",
    paddingTop: 40,
  },
  title: {
    fontSize: theme.fontSizes.display,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
  },
  eventContainer: {
    borderWidth: 2,
    width: "55%",
    height: 50,
    borderColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.medium,
  },
  icon: {
    height: 32,
    width: 32,
    tintColor: theme.colors.primary,
  },
  eventWrapper: {
    width: "90%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  scrollView: {
    alignItems: "center",
    width: "100%",
  },
  dateTitle: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    paddingLeft: theme.spacing.medium,
    fontSize: theme.fontSizes.large,
  },
});
