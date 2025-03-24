import { View, Text } from "react-native";
import TabsComponent from "../../../components/TabsComponent";

import globalStyles from "../../../constants/globalStyles";

export default function DepartmentsScreen() {
  return (
    <View style={globalStyles.secondaryContainer}>
      <Text>Departments</Text>
      <TabsComponent />
    </View>
  );
}
