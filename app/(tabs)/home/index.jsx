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
import NetInfo from "@react-native-community/netinfo";
import CollapsibleDropdown from "../../../components/CollapsibleDropdown";
import config from "../../../config/config";
import { getStoredUser, saveEvent } from "../../../src/database/queries";
import CustomModal from "../../../components/CustomModal";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const HomeIndex = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const fetchUpcomingEvents = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setIsLoading(true);
      }

      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

      const user = await getStoredUser();
      if (!user) {
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await axios.post(
        `${config.API_URL}/api/events/user/upcoming?block_id=${user.block_id}`
      );

      const events = response.data.events || [];

      const savedEvents = [];
      for (const event of events) {
        event.dates = event.dates.map(formatDate);
        await saveEvent(event);
        savedEvents.push(event);
      }

      setUpcomingEvents(savedEvents);
    } catch (err) {
      setError({
        title: "Error",
        message: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    const netInfo = await NetInfo.fetch();

    if (!netInfo.isConnected) {
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    fetchUpcomingEvents(true);
  }, []);

  useEffect(() => {
    fetchUpcomingEvents(false);
  }, []);

  return (
    <SafeAreaView className="bg-secondary h-full">
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            enabled={isConnected}
            colors={["#6200ea"]}
            tintColor={isConnected ? "#6200ea" : "#999999"}
          />
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

          {isLoading && upcomingEvents.length === 0 ? (
            <Text className="text-gray-500">Loading...</Text>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <View key={`${event.event_id}-${index}`} className="w-[303px]">
                <CollapsibleDropdown
                  title={event.event_name}
                  date={event.dates.join(", ")}
                  venue={event.venue}
                  morningIn={event.am_in}
                  afternoonIn={event.pm_in}
                  morningOut={event.am_out}
                  afternoonOut={event.pm_out}
                  personnel={event.scan_personnel}
                />
              </View>
            ))
          ) : (
            <Text className="text-gray-500">No upcoming events</Text>
          )}
        </View>
        <StatusBar style="dark" />
      </ScrollView>

      {error && (
        <CustomModal
          visible={!!error}
          onClose={() => setError(null)}
          title={error.title}
          message={error.message}
          type="error"
          buttonText="Okay"
          buttonAction={() => setError(null)}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeIndex;
