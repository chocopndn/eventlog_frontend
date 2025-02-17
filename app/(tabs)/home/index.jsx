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
} from "../../../database/queries";
import CustomModal from "../../../components/CustomModal";
import AsyncStorage from "@react-native-async-storage/async-storage";

const format12HourTime = (time) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  if (isNaN(hours) || isNaN(minutes)) return "";

  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes} ${period}`;
};

const formatGroupedDates = (dates) => {
  if (!dates || dates.length === 0) return "No date available";

  const sortedDates = [...dates].sort();

  let grouped = [];
  let tempGroup = [sortedDates[0]];

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const prevDate = new Date(sortedDates[i - 1]);

    if (currentDate - prevDate === 86400000) {
      tempGroup.push(sortedDates[i]);
    } else {
      grouped.push(tempGroup);
      tempGroup = [sortedDates[i]];
    }
  }

  grouped.push(tempGroup);

  return grouped
    .map((group) => {
      const start = new Date(group[0]);
      const end = new Date(group[group.length - 1]);

      if (group.length === 1) {
        return `${start.toLocaleString("en-US", {
          month: "long",
        })} ${start.getDate()} ${start.getFullYear()}`;
      } else if (group.length > 1) {
        const days = group.map((date) => new Date(date).getDate()).join(",");
        if (
          start.getMonth() === end.getMonth() &&
          start.getFullYear() === end.getFullYear()
        ) {
          return `${start.toLocaleString("en-US", {
            month: "long",
          })} ${days} ${start.getFullYear()}`;
        } else {
          const startMonthYear = `${start.toLocaleString("en-US", {
            month: "long",
          })} ${start.getDate()}`;
          const endMonthYear = `${end.toLocaleString("en-US", {
            month: "long",
          })} ${end.getDate()}`;
          return `${startMonthYear} - ${endMonthYear}, ${start.getFullYear()}`;
        }
      }
    })
    .join(", ");
};

const fetchFromAPI = async () => {
  try {
    const idNumber = String(await AsyncStorage.getItem("id_number"));
    if (!idNumber) {
      console.log("ID number not found in AsyncStorage.");
      return null;
    }

    const user = await getStoredUser();
    if (!user || String(user.id_number) !== idNumber) {
      console.log("User not found or ID mismatch.");
      return null;
    }

    const blockId = user.block_id;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const { data } = await axios.post(
      `${config.API_URL}/api/events/user/upcoming`,
      { block_id: blockId }
    );

    clearTimeout(timeout);

    if (data.success && data.events.length > 0) {
      console.log("Fetched events from API:", data.events);

      for (const event of data.events) {
        await saveEvent(event);
      }
    }

    return data.success ? data.events : null;
  } catch (error) {
    console.error("Error fetching data from API:", error);
    return null;
  }
};

const HomeIndex = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  const getEvents = async () => {
    if (isConnected) {
      const apiEvents = await fetchFromAPI();
      if (apiEvents) {
        setEvents(apiEvents);
      }
    } else {
      const storedEvents = await getStoredEvents();
      setEvents(storedEvents);
    }
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    getEvents();

    return () => unsubscribe();
  }, [isConnected]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getEvents();
    setRefreshing(false);
  }, [isConnected]);

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
                  date={formatGroupedDates(event.event_dates)}
                  venue={event.venue}
                  morningIn={format12HourTime(event.am_in)}
                  afternoonIn={format12HourTime(event.pm_in)}
                  morningOut={format12HourTime(event.am_out)}
                  afternoonOut={format12HourTime(event.pm_out)}
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
