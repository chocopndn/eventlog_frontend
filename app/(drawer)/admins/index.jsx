import { View, Text } from "react-native";
import TabsComponent from "../../../components/TabsComponent";

import globalStyles from "../../../constants/globalStyles";

export default function AdminsScreen() {
  return (
    <View style={globalStyles.secondaryContainer}>
      <Text>Admins</Text>
      <TabsComponent />
    </View>
  );
}
