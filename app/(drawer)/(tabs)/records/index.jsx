import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import { getRoleID } from "../../../../database/queries";

import CustomSearch from "../../../../components/CustomSearch";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

const Records = () => {
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    const fetchRoleId = async () => {
      const roleId = await getRoleID();
      setRoleId(roleId);
    };

    fetchRoleId();
  }, []);

  if (roleId === 1 || roleId === 2) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <View style={styles.searchContainer}>
          <CustomSearch placeholder="Search records" />
        </View>
        <ScrollView
          style={{ flex: 1, width: "100%", marginBottom: 20 }}
          contentContainerStyle={styles.scrollview}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ongoing Events</Text>
            <TouchableOpacity style={styles.eventContainer}>
              <Text style={styles.eventTitle}>National PRISAA 2025</Text>
              <Text style={styles.eventDate}>April 7, 8, 9, 10, 2025</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.eventContainer}>
              <Text style={styles.eventTitle}>IT Day</Text>
              <Text style={styles.eventDate}>April 7, 8, 9, 10, 2025</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Past Events</Text>
            <TouchableOpacity style={styles.eventContainer}>
              <Text style={styles.eventTitle}>Valentines Celebration</Text>
              <Text style={styles.eventDate}>February 7, 8, 9, 14, 2025</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.eventContainer}>
              <Text style={styles.eventTitle}>UCV Founding Anivesarry</Text>
              <Text style={styles.eventDate}>March 7, 8, 9, 10, 2025</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.eventContainer}>
              <Text style={styles.eventTitle}>UCV Founding Anivesarry</Text>
              <Text style={styles.eventDate}>March 7, 8, 9, 10, 2025</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.eventContainer}>
              <Text style={styles.eventTitle}>UCV Founding Anivesarry</Text>
              <Text style={styles.eventDate}>March 7, 8, 9, 10, 2025</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.eventContainer}>
              <Text style={styles.eventTitle}>UCV Founding Anivesarry</Text>
              <Text style={styles.eventDate}>March 7, 8, 9, 10, 2025</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.eventContainer}>
              <Text style={styles.eventTitle}>UCV Founding Anivesarry</Text>
              <Text style={styles.eventDate}>March 7, 8, 9, 10, 2025</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  } else if (roleId === 3) {
    return (
      <SafeAreaView>
        <Text>View for roleid 3</Text>
      </SafeAreaView>
    );
  }
};

export default Records;

const styles = StyleSheet.create({
  searchContainer: {
    width: "90%",
    marginTop: 30,
  },
  eventContainer: {
    borderWidth: 2,
    width: "90%",
    height: 50,
    borderColor: theme.colors.primary,
    marginTop: theme.spacing.medium,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.small,
  },
  scrollview: {
    alignItems: "center",
    flexGrow: 1,
  },
  eventTitle: {
    color: theme.colors.primary,
    fontFamily: "SquadaOne",
    fontSize: theme.fontSizes.large,
  },
  eventDate: {
    fontSize: theme.fontSizes.small,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
  },
  sectionContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.title,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
  },
});
