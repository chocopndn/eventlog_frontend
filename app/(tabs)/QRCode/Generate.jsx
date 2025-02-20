import React, { useEffect, useState } from "react";
import { View, SafeAreaView, Text } from "react-native";
import { getStoredEvents } from "../../../database/queries";
import SharpDropdown from "../../../components/SharpDropdown";
import QRCode from "react-native-qrcode-svg";
import CustomButton from "../../../components/CustomButton";
import InfoCard from "../../../components/InfoCard";

export default function Generate() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [qrValue, setQrValue] = useState("");
  const [showInfoCard, setShowInfoCard] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchEvents() {
      try {
        const storedEvents = await getStoredEvents();
        if (isMounted) {
          const formattedEvents = storedEvents.map((event) => ({
            label: event.event_name,
            value: event.event_id,
          }));
          setEvents(formattedEvents);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching events:", error);
        }
      }
    }

    fetchEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetState = () => {
    setSelectedEvent(null);
    setQrValue("");
    setShowInfoCard(false);
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
                onSelect={setSelectedEvent}
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
                    onPress={() => {
                      setQrValue(selectedEvent.toString());
                      setShowInfoCard(true);
                    }}
                  />
                ) : null}
              </View>
            </>
          ) : (
            <View className="flex items-center">
              <View className="mb-6 mt-16">
                <InfoCard
                  title="Title"
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

        {showInfoCard && (
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
