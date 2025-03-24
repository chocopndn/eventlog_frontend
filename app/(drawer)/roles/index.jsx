import { View, Text } from "react-native";
import TabsComponent from "../../../components/TabsComponent";

import globalStyles from "../../../constants/globalStyles";

export default function RolesScreen() {
  return (
    <View style={globalStyles.secondaryContainer}>
      <Text>Roles</Text>
      <TabsComponent />
    </View>
  );
}
