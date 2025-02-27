import React, { useEffect, useState } from "react";
import { View, SafeAreaView, Text } from "react-native";
import { getStoredEvents, getStoredUser } from "../../../database/queries";
import SharpDropdown from "../../../components/SharpDropdown";
import QRCode from "react-native-qrcode-svg";
import CustomButton from "../../../components/CustomButton";
import InfoCard from "../../../components/InfoCard";
import * as Crypto from "expo-crypto";

export default function Generate() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [qrValue, setQrValue] = useState("");
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

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
    if (selectedEvent && user && user.id_number) {
      try {
        const dataToEncrypt = `${user.id_number}-${selectedEventName}`;
        const encryptedData = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          dataToEncrypt
        );
        setQrValue(encryptedData);
        setShowInfoCard(true);
      } catch (error) {
        console.error("Encryption error:", error);
        Alert.alert("Error", "An error occurred during QR code generation.");
      }
    } else {
      let message = "";
      if (!selectedEvent) {
        message = "Please select an event.";
      } else if (!user) {
        message = "User data not found. Please log in or check your profile.";
      } else if (!user.id_number) {
        message = "User ID number not found. Please check your profile.";
      }
      Alert.alert("Error", message);
    }
  };

  const resetState = () => {
    setSelectedEvent(null);
    setQrValue("");
    setShowInfoCard(false);
    setSelectedEventName("");
  };

  const closeModal = () => {
    setModalVisible(false);
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
                  title={selectedEventName || "Title"}
                  name="Dhanrev Mina"
                  id_number="19015236"
                  course="BSIT"
                  block="3A NON"
                  onTitlePress={resetState}
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

      <CustomModal
        visible={modalVisible}
        onClose={closeModal}
        title={modalTitle}
        message={modalMessage}
        buttonText="OK"
      />
    </SafeAreaView>
  );
}
