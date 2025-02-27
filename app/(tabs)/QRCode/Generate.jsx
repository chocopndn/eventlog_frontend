import React, { useEffect, useState } from "react";
import { View, SafeAreaView, Text, Alert } from "react-native";
import { getStoredEvents, getStoredUser } from "../../../database/queries";
import SharpDropdown from "../../../components/SharpDropdown";
import QRCode from "react-native-qrcode-svg";
import CustomButton from "../../../components/CustomButton";
import InfoCard from "../../../components/InfoCard";
import CryptoES from "crypto-es";

const SECRET_KEY = "your_secret_key";

export default function Generate() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [qrValue, setQrValue] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedEvents = await getStoredEvents();
        const storedUser = await getStoredUser();

        setEvents(
          storedEvents.map((event) => ({
            label: event.event_name,
            value: event.event_id,
            name: event.event_name,
          }))
        );
        setUser(storedUser);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to fetch data.");
      }
    };

    fetchData();
  }, []);

  const generateQrCode = async () => {
    if (!selectedEvent || !user?.id_number) {
      Alert.alert("Error", "Select an event and check user data.");
      return;
    }

    try {
      const idNumber = user.id_number;
      const eventId = selectedEvent.value;
      const currentDate = new Date().toISOString().split("T")[0];
      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour12: false,
      });

      const dataToEncrypt = JSON.stringify({
        id_number: idNumber,
        eventId,
        currentDate,
        currentTime,
      });

      const encryptedData = CryptoES.AES.encrypt(
        dataToEncrypt,
        SECRET_KEY
      ).toString();

      setQrValue(encryptedData);
    } catch (error) {
      console.error("Encryption error:", error);
      Alert.alert("Error", "Failed to encrypt data.");
    }
  };

  const decryptQrCode = (encryptedText) => {
    try {
      if (!encryptedText) {
        Alert.alert("Error", "No QR code data available.");
        return;
      }

      const bytes = CryptoES.AES.decrypt(encryptedText, SECRET_KEY);
      const decryptedData = bytes.toString(CryptoES.enc.Utf8);

      return JSON.parse(decryptedData);
    } catch (error) {
      console.error("Decryption error:", error);
      Alert.alert("Error", "Invalid QR code data.");
      return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <View className="flex-1 justify-start items-center h-full m-20">
        <View className="border-2 border-primary h-[200px] w-[200px] flex justify-center items-center bg-secondary mb-4">
          {qrValue ? (
            <QRCode size={180} value={qrValue} backgroundColor="#FBF1E5" />
          ) : null}
        </View>

        <View className="h-[200px] w-[280px] flex justify-center items-center">
          {!qrValue ? (
            <>
              <SharpDropdown
                data={events}
                defaultValue={selectedEvent?.value}
                onSelect={(value) =>
                  setSelectedEvent(
                    events.find((e) => e.value === value) || null
                  )
                }
                placeholder={selectedEvent?.label || "SELECT EVENT"}
              />

              <View className="h-[60px] w-full flex justify-center items-center mt-6">
                {selectedEvent && (
                  <CustomButton
                    title="Generate QR"
                    type="primary"
                    onPress={generateQrCode}
                  />
                )}
              </View>
            </>
          ) : (
            <View className="flex items-center">
              <View className="mb-6 mt-16">
                <InfoCard
                  title={selectedEvent?.name || "Unknown Event"}
                  name="Dhanrev Mina"
                  id_number={user?.id_number || "N/A"}
                  course="BSIT"
                  block="3A NON"
                  onTitlePress={() => setQrValue("")}
                />
              </View>
            </View>
          )}
        </View>

        {qrValue && (
          <View className="border-2 border-primary w-[280px] mt-auto self-center mb-4">
            <Text className="font-SquadaOne text-[20px] p-3 text-center text-primary">
              NOTE: The Instructors/Officers in charge will scan your QR Code.
              Approach them immediately.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
