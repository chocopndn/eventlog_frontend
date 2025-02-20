import { Text, View, SafeAreaView } from "react-native";
import React from "react";

import SharpDropdown from "../../../components/SharpDropdown";

export default function Generate() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white">
      <SharpDropdown />
    </SafeAreaView>
  );
}
