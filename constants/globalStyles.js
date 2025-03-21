import { StyleSheet } from "react-native";
import theme from "./theme";

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  primaryContainer: {
    backgroundColor: theme.colors.primary,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryContainer: {
    backgroundColor: theme.colors.secondary,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default globalStyles;
