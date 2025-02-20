import { useEffect, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import CustomButton from "../../../components/CustomButton";
import { getStoredUser } from "../../../database/queries";

export default function QRCodeIndex() {
  const [roleId, setRoleId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await getStoredUser();
      if (storedUser) {
        setRoleId(storedUser.role_id);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (roleId === 1) {
      router.replace("/QRCode/Generate"); // Redirect to Generate.jsx
    } else if (roleId === 3 || roleId === 4) {
      router.replace("/QRCode/Scan"); // Redirect to Scan.jsx
    }
  }, [roleId]);

  if (roleId === 1 || roleId === 3 || roleId === 4) {
    return null; // Prevent unnecessary rendering when redirecting
  }

  return (
    <View className="flex-1 items-center justify-center bg-secondary">
      {roleId === 2 && (
        <>
          <CustomButton
            title="Generate"
            onPress={() => router.push("/Generate")}
          />
          <CustomButton
            title="Scan"
            type="secondary"
            onPress={() => router.push("/Scan")}
          />
        </>
      )}
    </View>
  );
}
