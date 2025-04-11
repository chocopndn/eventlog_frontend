import { StyleSheet, Text, View } from "react-native";
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
});
