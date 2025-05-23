import { StyleSheet, Text, View, ScrollView } from "react-native";
import React from "react";

import WebHeader from "../../components/WebHeader";
import globalStyles from "../../constants/globalStyles";
import CustomSearch from "../../components/CustomSearch";
import CustomDropdown from "../../components/CustomDropdown";
import CustomButton from "../../components/CustomButton";
import theme from "../../constants/theme";

const Records = () => {
  return (
    <View
      style={[
        globalStyles.secondaryContainer,
        { padding: 0, justifyContent: "flex-start" },
      ]}
    >
      <WebHeader />

      <View style={styles.searchContainer}>
        <CustomSearch />
      </View>

      <View style={styles.dropdownWrapper}>
        <View style={styles.dropdownContainer}>
          <CustomDropdown display="sharp" placeholder="Department" />
        </View>
        <View
          style={[
            styles.dropdownContainer,
            { marginLeft: theme.spacing.medium },
          ]}
        >
          <CustomDropdown display="sharp" placeholder="Year Level" />
        </View>
      </View>

      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={styles.scrollView}
      >
        <View style={styles.listHeader}>
          <View style={[styles.id, styles.headerText]}>ID Number</View>
          <View style={[styles.name, styles.headerText]}>Name</View>
          <View style={[styles.block, styles.headerText]}>Block</View>
          <View style={[styles.department, styles.headerText]}>Department</View>
          <View style={[styles.present, styles.headerText]}>Present</View>
          <View style={[styles.absent, styles.headerText]}>Absent</View>
        </View>
      </ScrollView>

      <View style={styles.printDlButton}>
        <View style={styles.buttonWrapper}>
          <View style={styles.buttonContainer}>
            <CustomButton title="DOWNLOAD" />
          </View>
          <View style={styles.buttonContainer}>
            <CustomButton title="PRINT" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default Records;

const styles = StyleSheet.create({
  searchContainer: {
    width: "90%",
    paddingTop: 40,
  },
  dropdownWrapper: {
    flexDirection: "row",
    marginTop: theme.spacing.large,
    width: "90%",
    justifyContent: "center",
  },
  dropdownContainer: {
    width: "49%",
  },
  buttonContainer: {
    width: "30%",
    padding: theme.spacing.medium,
  },
  buttonWrapper: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  printDlButton: {
    width: "100%",
  },
  scrollView: {
    justifyContent: "center",
    alignItems: "center",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "center",
  },
  headerText: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.large,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  id: {
    width: "50%",
  },
  name: {
    width: "100%",
  },
  block: {
    width: "50%",
  },
  department: {
    width: "50%",
  },
  present: {
    width: "50%",
  },
  absent: {
    width: "50%",
  },
});
