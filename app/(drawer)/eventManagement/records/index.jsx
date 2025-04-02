import { View, Text } from "react-native";
import TabsComponent from "../../../../components/TabsComponent";

import globalStyles from "../../../../constants/globalStyles";

export default function RecordsScreen() {
  return (
    <View style={globalStyles.secondaryContainer}>
      <Text>Records</Text>
      <TabsComponent />
    </View>
  );
}
