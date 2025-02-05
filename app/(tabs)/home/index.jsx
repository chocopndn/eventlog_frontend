import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axios from "axios";

import CollapsibleDropdown from "../../../components/CollapsibleDropdown";
import config from "../../../config/config";
import { getStoredUser } from "../../database/queries";

const HomeIndex = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUpcomingEvents = async () => {
    try {
      const user = await getStoredUser();

      const response = await axios.post(
        `${config.API_URL}/api/events/user/upcoming`,
        { block_id: user.block_id }
      );

      console.log("API Response:", response.data.events);
      setUpcomingEvents(response.data?.events || []);
    } catch (error) {
      console.error("API Error:", error);
      setError("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUpcomingEvents();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView className="bg-secondary h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 items-center bg-secondary pt-[100px]">
          <Text className="font-SquadaOne color-primary text-[80px] mt-8">
            EVENTLOG
          </Text>
          <Text className="font-SquadaOne color-primary text-[35px] pt-5">
            ANNOUNCEMENT
          </Text>
          <View className="w-full items-center justify-center pb-8">
            <View className="w-[303px] h-1 bg-primary"></View>
          </View>

          <TouchableOpacity
            className="border-2 w-[303px] h-[52px] border-primary justify-center pl-3 mb-5"
            onPress={() => router.push("/home/Welcome")}
          >
            <Text className="font-SquadaOne color-primary text-[20px] text-center">
              WELCOME EVENTLOG USERS!
            </Text>
          </TouchableOpacity>

          {upcomingEvents.length > 0
            ? upcomingEvents.map((event, index) => (
                <View
                  key={event.event_name_id || `event-${index}`}
                  className="w-[303px]"
                >
                  <CollapsibleDropdown
                    title={event.event_name}
                    date={event.event_dates}
                    venue={event.venue}
                    morningIn={event.am_in}
                    afternoonIn={event.pm_in}
                    morningOut={event.am_out}
                    afternoonOut={event.pm_out}
                    personnel={event.scan_personnel}
                  />
                </View>
              ))
            : !isLoading && (
                <Text className="text-gray-500">No upcoming events</Text>
              )}
        </View>
        <StatusBar style="dark" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeIndex;
