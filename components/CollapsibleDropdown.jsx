import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingViewBase,
} from "react-native";
import Collapsible from "react-native-collapsible";

import theme from "../constants/theme";

const CollapsibleDropdown = ({
  title,
  date,
  venue,
  am_in,
  am_out,
  pm_in,
  pm_out,
  personnel,
  description,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsCollapsed(!isCollapsed)}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>{date}</Text>
      </TouchableOpacity>
      <Collapsible collapsed={isCollapsed}>
        <View style={styles.content}>
          <View>
            <Text style={styles.contentTitle}>VENUE OF TIME IN/OUT:</Text>
            <Text style={styles.details}>{venue}</Text>
          </View>
          <View>
            <Text
              style={[
                styles.contentTitle,
                { paddingTop: theme.spacing.medium },
              ]}
            >
              DESCRIPTION:
            </Text>
            <Text style={styles.details}>{description}</Text>
          </View>
          <View style={styles.timeContainer}>
            <View style={styles.contentContainer}>
              <Text style={styles.contentTitle}>TIME IN:</Text>
              <View style={styles.time}>
                <Text style={styles.timeOfDay}>Morning:</Text>
                <Text style={styles.detailsTime}>{am_in}</Text>
              </View>
              <View style={styles.time}>
                <Text style={styles.timeOfDay}>Afternoon:</Text>
                <Text style={styles.detailsTime}>{pm_in}</Text>
              </View>
            </View>

            <View style={styles.contentContainer}>
              <Text style={styles.contentTitle}>TIME OUT:</Text>
              <View style={styles.time}>
                <Text style={styles.timeOfDay}>Morning:</Text>
                <Text style={styles.detailsTime}>{am_out}</Text>
              </View>
              <View style={styles.time}>
                <Text style={styles.timeOfDay}>Afternoon:</Text>
                <Text style={styles.detailsTime}>{pm_out}</Text>
              </View>
            </View>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>SCAN PERSONNEL:</Text>
            <Text style={styles.details}>{personnel}</Text>
          </View>
        </View>
      </Collapsible>
    </View>
  );
};

export default CollapsibleDropdown;

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.small,
    width: "100%",
  },
  button: {
    backgroundColor: theme.colors.secondary,
    padding: 10,
    justifyContent: "center",
    height: 50,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  title: {
    color: theme.colors.primary,
    fontFamily: "SquadaOne",
    fontSize: theme.fontSizes.large,
  },
  content: {
    padding: theme.spacing.small,
    backgroundColor: theme.colors.secondary,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: theme.colors.primary,
    height: 250,
    justifyContent: "center",
  },
  date: {
    fontSize: theme.fontSizes.small,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
  },
  contentTitle: {
    fontFamily: "ArialBold",
    color: theme.colors.primary,
  },
  details: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.extraSmall,
    fontFamily: "Arial",
  },
  time: {
    flexDirection: "row",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeOfDay: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.extraSmall,
    fontFamily: "ArialBold",
  },
  detailsTime: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.extraSmall,
    fontFamily: "Arial",
  },
  contentContainer: {
    paddingTop: theme.spacing.medium,
  },
});
