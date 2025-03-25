import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Collapsible from "react-native-collapsible";

import theme from "../constants/theme";

const CollapsibleDropdown = ({ title, date }) => {
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
          <Text>blahblah</Text>
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
    height: 200,
  },
  date: {
    fontSize: theme.fontSizes.small,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
    paddingTop: theme.spacing.xsmall,
  },
});
