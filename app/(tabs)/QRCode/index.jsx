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
      router.replace("/QRCode/Generate");
    } else if (roleId === 3 || roleId === 4) {
      router.replace("/QRCode/Scan");
    }
  }, [roleId]);

  if (roleId === 1 || roleId === 3 || roleId === 4) {
    return null;
  }

  return (
    <View className="flex-1 items-center justify-center bg-secondary">
      {roleId === 2 && (
        <>
          <CustomButton
            title="Generate"
            onPress={() => router.push("/QRCode/Generate")}
          />
          <CustomButton
            title="Scan"
            type="secondary"
            onPress={() => router.push("/QRCode/Scan")}
          />
        </>
      )}
    </View>
  );
}
