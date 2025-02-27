import React, { useEffect, useState } from "react";
import { View, SafeAreaView, Text } from "react-native";
import { getStoredEvents, getStoredUser } from "../../../database/queries";
import SharpDropdown from "../../../components/SharpDropdown";
import QRCode from "react-native-qrcode-svg";
import CustomButton from "../../../components/CustomButton";
import InfoCard from "../../../components/InfoCard";
import CryptoES from "crypto-es";
import CustomModal from "../../../components/CustomModal";

import config from "../../../config/config";

export default function Generate() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [qrValue, setQrValue] = useState("");
  const [showInfoCard, setShowInfoCard] = useState(false);
  const [selectedEventName, setSelectedEventName] = useState("");
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const storedEvents = await getStoredEvents();
        const storedUser = await getStoredUser();

        if (isMounted) {
          const formattedEvents = storedEvents.map((event) => ({
            label: event.event_name,
            value: event.event_id,
            name: event.event_name,
          }));
          setEvents(formattedEvents);
          setUser(storedUser);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching data:", error);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEventSelect = (value) => {
    setSelectedEvent(value);
    const selectedEventObj = events.find((e) => e.value === value);
    if (selectedEventObj) {
      setSelectedEventName(selectedEventObj.name);
    } else {
      setSelectedEventName("");
    }
  };

  const generateQrCode = async () => {
    if (selectedEvent && user && user.id_number) {
      try {
        const dataToEncrypt = `${user.id_number}-${selectedEvent}`;
        const password = config.QR_PASS;
        const encrypted = CryptoES.AES.encrypt(
          dataToEncrypt,
          password
        ).toString();
        console.log(encrypted);

        setQrValue(encrypted);
        setShowInfoCard(true);
      } catch (error) {
        console.error("Encryption error:", error);
        setModalTitle("Error");
        setModalMessage("An error occurred during QR code generation.");
        setModalVisible(true);
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
      setModalTitle("Error");
      setModalMessage(message);
      setModalVisible(true);
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
          {!showInfoCard ? (
            <>
              <SharpDropdown
                data={events}
                defaultValue={selectedEvent}
                onSelect={handleEventSelect}
                placeholder={
                  selectedEvent
                    ? events.find((e) => e.value === selectedEvent)?.label
                    : "SELECT EVENT"
                }
              />

              <View className="h-[60px] w-full flex justify-center items-center mt-6">
                {selectedEvent ? (
                  <CustomButton
                    title="Generate QR"
                    type="primary"
                    onPress={generateQrCode}
                  />
                ) : null}
              </View>
            </>
          ) : (
            <View className="flex items-center">
              <View className="mb-6 mt-16">
                {user && (
                  <InfoCard
                    title={selectedEventName || "Title"}
                    name={user.name || "N/A"}
                    id_number={user.id_number || "N/A"}
                    course={user.course || "N/A"}
                    block={user.block || "N/A"}
                    onTitlePress={resetState}
                  />
                )}
              </View>
            </View>
          )}
        </View>

        {showInfoCard && (
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
