import { StyleSheet, Text, View } from "react-native";
import React from "react";

import theme from "../../../../constants/theme";
import globalStyles from "../../../../constants/globalStyles";

const Attendance = () => {
  return (
    <View style={globalStyles.secondaryContainer}>
      <View style={styles.attendanceWrapper}></View>
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
});
