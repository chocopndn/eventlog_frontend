import { View, Text } from "react-native";
import TabsComponent from "../../../components/TabsComponent";

import globalStyles from "../../../constants/globalStyles";

export default function StudentsLayout() {
  return (
    <View style={globalStyles.secondaryContainer}>
      <Text>Students</Text>
      <TabsComponent />
    </View>
  );
}
