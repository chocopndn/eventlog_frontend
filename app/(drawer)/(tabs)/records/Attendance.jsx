import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";

import theme from "../../../../constants/theme";
import globalStyles from "../../../../constants/globalStyles";

const Attendance = () => {
  return (
    <View style={globalStyles.secondaryContainer}>
      <View style={styles.attendanceWrapper}>
        <View>
          <Text style={styles.eventTitle}>PRISAA National 2025</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scrollviewContainer}>
          <View style={styles.attendanceContainer}>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>April 7, 2025</Text>
            </View>

            <View>
              <View style={styles.morningContainer}>
                <View style={styles.morningTextContainer}>
                  <Text style={styles.morningText}>Morning</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default Attendance;

const styles = StyleSheet.create({
  attendanceWrapper: {
    flex: 1,
    width: "100%",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  eventTitle: {
    fontSize: theme.fontSizes.huge,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    textAlign: "center",
    paddingTop: theme.spacing.medium,
    paddingBottom: theme.spacing.medium,
  },
  scrollviewContainer: {
    paddingHorizontal: theme.spacing.medium,
  },
  dateContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 3,
    borderColor: theme.colors.primary,
    height: 40,
  },
  date: {
    fontSize: theme.fontSizes.extraLarge,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    textAlign: "center",
  },
  attendanceContainer: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  morningText: {
    fontSize: theme.fontSizes.extraLarge,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    textAlign: "center",
  },
  morningContainer: {
    height: 40,
    justifyContent: "center",
  },
});
