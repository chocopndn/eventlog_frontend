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
  icons: {
    width: 24,
    height: 24,
    tintColor: theme.colors.gray,
  },
});

export default globalStyles;
