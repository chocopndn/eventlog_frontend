import { useLocalSearchParams } from "expo-router";
import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../../config/config";

const EditEvent = () => {
  const { id } = useLocalSearchParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/events/${id}`);
        if (response.data.success) {
          setEvent(response.data.event);
        }
        console.log(response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" color="blue" />;
  }

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20 }}>Editing: {event?.name}</Text>
      <Text>{event?.description}</Text>
    </View>
  );
};

export default EditEvent;
