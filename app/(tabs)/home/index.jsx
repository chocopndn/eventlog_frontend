import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import CollapsibleDropdown from "../../../components/CollapsibleDropdown";
import config from "../../../config/config";
import {
  getStoredUser,
  saveEvent,
  getStoredEvents,
  removeEvent,
} from "../../../database/queries";
import CustomModal from "../../../components/CustomModal";

const formatTime = (time) =>
  time
    ? new Date(`1970-01-01T${time}Z`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      })
    : "";

const formatGroupedDates = (dates) => {
  if (!dates || dates.length === 0) return "No date available";

  const sortedDates = [...dates].sort();
  let grouped = [];
  let tempGroup = [];
  let prevMonthYear = "";

  sortedDates.forEach((date, index) => {
    const [year, month, day] = date.split("-");
    const monthName = new Date(date).toLocaleString("en-US", { month: "long" });
    const monthYear = `${monthName} ${year}`;

    if (monthYear === prevMonthYear) {
      tempGroup.push(day);
    } else {
      if (tempGroup.length > 0) {
        grouped.push(`${prevMonthYear} ${tempGroup.join(", ")}`);
      }
      tempGroup = [day];
    }

    prevMonthYear = monthYear;

    if (index === sortedDates.length - 1) {
      grouped.push(`${prevMonthYear} ${tempGroup.join(", ")}`);
    }
  });

  return grouped.join(", ");
};

const syncDatabaseWithAPI = async (apiEvents) => {
  const storedEvents = await getStoredEvents();
  const storedEventIds = new Set(storedEvents.map((e) => e.event_id));

  for (const event of storedEvents) {
    if (!apiEvents.some((e) => e.event_id === event.event_id)) {
      await removeEvent(event.event_id);
    }
  }

  for (const event of apiEvents) {
    if (!storedEventIds.has(event.event_id)) {
      try {
        await saveEvent(event);
      } catch (error) {
        console.error(`Error saving event ${event.event_id}:`, error);
      }
    }
  }
};

const fetchFromAPI = async () => {
  try {
    const user = await getStoredUser();
    if (!user) return null;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const { data } = await axios.post(
      `${config.API_URL}/api/events/user/upcoming?block_id=${user.block_id}`,
      {},
      { signal: controller.signal }
    );

    clearTimeout(timeout);
    return data.success ? data.events : null;
  } catch {
    return null;
  }
};

const HomeIndex = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        updateSQLiteFromAPI();
      }
    });

    loadStoredEvents();

    return () => unsubscribe();
  }, []);

  const loadStoredEvents = async () => {
    setIsLoading(true);
    const storedEvents = await getStoredEvents();
    setEvents(
      storedEvents.map((event) => ({
        ...event,
        dates: formatGroupedDates(event.dates),
        am_in: formatTime(event.am_in),
        pm_in: formatTime(event.pm_in),
        am_out: formatTime(event.am_out),
        pm_out: formatTime(event.pm_out),
      }))
    );
    setIsLoading(false);
  };

  const updateSQLiteFromAPI = async () => {
    try {
      const apiEvents = await fetchFromAPI();
      if (apiEvents) {
        await syncDatabaseWithAPI(apiEvents);
      }
      await loadStoredEvents();
    } catch (error) {
      console.error("Error syncing with API:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await updateSQLiteFromAPI();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView className="bg-secondary h-full">
      <View className="flex-1 items-center bg-secondary pb-5">
        <Text className="font-SquadaOne color-primary text-[80px]">
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
          {isLoading && events.length === 0 ? (
            <Text className="text-gray-500">Loading...</Text>
          ) : events.length > 0 ? (
            events.map((event, index) => (
              <View key={`${event.event_id}-${index}`} className="w-[303px]">
                <CollapsibleDropdown
                  title={event.event_name}
                  date={event.dates}
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
        </ScrollView>
      </View>
      <StatusBar style="dark" />

      {error && (
        <CustomModal
          visible={!!error}
          onClose={() => setError(null)}
          title={<Text>{error.title}</Text>}
          message={<Text>{error.message}</Text>}
          type="error"
          buttonText="Okay"
          buttonAction={() => setError(null)}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeIndex;
