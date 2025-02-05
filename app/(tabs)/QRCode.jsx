import { View, SafeAreaView, Image } from "react-native";
import React, { useState, useEffect } from "react";
import QRCode from "react-native-qrcode-svg";
import images from "../../constants/images";
import CustomDropdown2 from "../../components/CustomDropdown2";
import { getStoredEvents } from "../../src/database/queries";

const QRCodeScreen = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const storedEvents = await getStoredEvents();

        if (storedEvents.length > 0) {
          setEvents(
            storedEvents.map((event) => ({
              label: event.event_name,
              value: event.event_id,
            }))
          );
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <SafeAreaView className="bg-secondary h-full items-center justify-center">
      <View className="relative w-[200px] h-[200px] border-primary border-[3px] items-center justify-center">
        <QRCode
          value={
            selectedEvent ? `Event ID: ${selectedEvent}` : "No Event Selected"
          }
          logoBackgroundColor="#FBF1E5"
          backgroundColor="transparent"
          size={190}
        />
        <View className="absolute bg-primary rounded-full p-1">
          <Image source={images.logo} className="w-[45px] h-[45px]" />
        </View>
      </View>

      <CustomDropdown2
        placeholder="Select Event"
        data={events}
        onSelect={(eventId) => setSelectedEvent(eventId)}
      />
    </SafeAreaView>
  );
};

export default QRCodeScreen;
