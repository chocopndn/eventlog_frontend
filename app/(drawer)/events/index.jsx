import { View, Text } from "react-native";
import TabsComponent from "../../../components/TabsComponent";

import globalStyles from "../../../constants/globalStyles";

export default function EventsScreen() {
  return (
    <View style={globalStyles.secondaryContainer}>
      <Text>Events</Text>
      <TabsComponent />
    </View>
  );
}
