import { StyleSheet, View, Image, Text, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import QRCode from "react-native-qrcode-svg";
import CustomDropdown from "../../../../components/CustomDropdown";
import { getStoredUser, getStoredEvents } from "../../../../database/queries";
import CryptoES from "crypto-es";
import { QR_SECRET_KEY } from "../../../../config/config";
import socketService from "../../../../services/socketService";
import { useAuth } from "../../../../context/AuthContext";
import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import images from "../../../../constants/images";

const Generate = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchData = async () => {
    try {
      const userData = await getStoredUser();
      const eventsData = await getStoredEvents();
      const approvedEvents = (eventsData || []).filter(
        (event) => event.status === "Approved"
      );
      setUser(userData);
      setEvents(approvedEvents);
      if (selectedEvent) {
        const isSelectedEventStillValid = approvedEvents.some(
          (event) => event.event_id === selectedEvent.event_id
        );
        if (!isSelectedEventStillValid) {
          setSelectedEvent(null);
        }
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (authUser?.block_id) {
      socketService.connect();
      socketService.joinRoom(`block-${authUser.block_id}`);

      socketService.socket?.off("upcoming-events-updated");
      socketService.socket?.off("events-list-updated");
      socketService.socket?.off("newApprovedEvent");
      socketService.socket?.off("new-event-added");
      socketService.socket?.off("event-deleted");
      socketService.socket?.off("event-status-changed");
      socketService.socket?.off("database-updated");

      socketService.socket?.on("database-updated", (data) => {
        if (data.type === "event-saved") {
          setTimeout(() => fetchData(), 200);
        }
      });

      socketService.socket?.on("upcoming-events-updated", (data) => {
        if (data.block_id === authUser.block_id) {
          fetchData();
        }
      });

      socketService.socket?.on("events-list-updated", (data) => {
        if (data.type === "upcoming") {
          fetchData();
        }
      });

      socketService.socket?.on("newApprovedEvent", (data) => {
        const eventBlockIds = data.data?.block_ids || [];
        const userBlockId = authUser?.block_id;
        const isRelevantToUser =
          eventBlockIds.includes(userBlockId) ||
          eventBlockIds.includes(userBlockId?.toString()) ||
          eventBlockIds.includes(parseInt(userBlockId));
        if (isRelevantToUser) {
          setEvents((prevEvents) => {
            const eventExists = prevEvents.some(
              (event) => event.event_id === data.data.event_id
            );
            if (!eventExists && data.data.status === "Approved") {
              return [data.data, ...prevEvents];
            }
            return prevEvents;
          });
          setTimeout(() => fetchData(), 500);
          setTimeout(() => fetchData(), 1500);
          setTimeout(() => fetchData(), 3000);
        }
      });

      socketService.socket?.on("new-event-added", (data) => {
        if (data.block_ids?.includes(authUser?.block_id)) {
          if (data.event?.status === "Approved") {
            setEvents((prevEvents) => {
              const eventExists = prevEvents.some(
                (event) => event.event_id === data.event.event_id
              );
              if (!eventExists) {
                return [data.event, ...prevEvents];
              }
              return prevEvents;
            });
            setTimeout(() => fetchData(), 500);
            setTimeout(() => fetchData(), 1500);
            setTimeout(() => fetchData(), 3000);
          }
        }
      });

      socketService.socket?.on("event-deleted", (data) => {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.event_id !== data.eventId)
        );
        if (selectedEvent && selectedEvent.event_id === data.eventId) {
          setSelectedEvent(null);
        }
      });

      socketService.socket?.on("event-status-changed", (data) => {
        if (data.newStatus === "Approved") {
          setEvents((prevEvents) => {
            const eventExists = prevEvents.some(
              (event) => event.event_id === data.eventId
            );
            if (!eventExists && data.eventData) {
              return [data.eventData, ...prevEvents];
            }
            return prevEvents;
          });
        } else if (
          data.newStatus === "Pending" ||
          data.newStatus === "Rejected"
        ) {
          setEvents((prevEvents) =>
            prevEvents.filter((event) => event.event_id !== data.eventId)
          );
          if (selectedEvent && selectedEvent.event_id === data.eventId) {
            setSelectedEvent(null);
          }
        }
      });
    }

    return () => {
      if (authUser?.block_id) {
        socketService.leaveRoom(`block-${authUser.block_id}`);
      }
      socketService.socket?.off("upcoming-events-updated");
      socketService.socket?.off("events-list-updated");
      socketService.socket?.off("newApprovedEvent");
      socketService.socket?.off("new-event-added");
      socketService.socket?.off("event-deleted");
      socketService.socket?.off("event-status-changed");
      socketService.socket?.off("database-updated");
    };
  }, [authUser, selectedEvent]);

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
  };

  const encryptQRValue = (value) => {
    if (!value) return null;
    return CryptoES.AES.encrypt(value, QR_SECRET_KEY).toString();
  };

  const getEventDateId = (event) => {
    if (
      !event ||
      !Array.isArray(event.event_dates) ||
      !Array.isArray(event.event_date_ids)
    ) {
      return null;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < event.event_dates.length; i++) {
      const eventDate = new Date(event.event_dates[i]);
      eventDate.setHours(0, 0, 0, 0);
      if (eventDate.getTime() === today.getTime()) {
        return event.event_date_ids[i];
      }
    }
    return event.event_date_ids[0];
  };

  return (
    <View style={globalStyles.secondaryContainer}>
      <View style={styles.qrCodeContainer}>
        {selectedEvent && user && (
          <QRCode
            value={
              encryptQRValue(
                `eventlog-${getEventDateId(selectedEvent)}-${user?.id_number}`
              ) || "INVALID"
            }
            backgroundColor={theme.colors.secondary}
            size={200}
          />
        )}
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoBackground,
              !selectedEvent && styles.logoBackgroundNoEvent,
            ]}
          >
            <Image
              source={images.logo}
              style={!selectedEvent ? styles.logoLarger : styles.logo}
            />
          </View>
        </View>
      </View>
      <View style={styles.dropdownContainer}>
        <CustomDropdown
          display="sharp"
          fontFamily={theme.fontFamily.SquadaOne}
          placeholder="SELECT EVENT"
          placeholderFontSize={theme.fontSizes.large}
          placeholderColor={theme.colors.primary}
          selectedEventColor={theme.colors.primary}
          selectedEventFont={theme.fontFamily.SquadaOne}
          selectedEventFontSize={theme.fontSizes.large}
          data={events.map((event) => ({
            label: event.event_name,
            value: event.event_id,
          }))}
          value={selectedEvent?.event_id || null}
          onSelect={(selectedItem) => {
            if (
              !selectedItem ||
              selectedItem.value === selectedEvent?.event_id
            ) {
              handleEventSelect(null);
            } else {
              const selectedEventObject = events.find(
                (event) => event.event_id === selectedItem.value
              );
              handleEventSelect(selectedEventObject);
            }
          }}
        />
      </View>
      {user && (
        <View style={styles.userDetailsContainer}>
          <Text style={styles.userDetails}>
            {`${user.first_name} ${user.middle_name} ${user.last_name}${
              user.suffix ? ` ${user.suffix}` : ""
            }`}
          </Text>
          <Text style={styles.userDetails}>ID: {user.id_number}</Text>
          <Text style={styles.userDetails}>Course: {user.course_code}</Text>
          <Text style={styles.userDetails}>Block: {user.block_name}</Text>
        </View>
      )}
      <View style={styles.noteContainer}>
        <Text style={styles.note}>
          NOTE: The instructors or officers in-charged will scan your QR Code.
          Approach them immediately.
        </Text>
      </View>
      <StatusBar style="light" />
    </View>
  );
};

export default Generate;

const styles = StyleSheet.create({
  qrCodeContainer: {
    position: "relative",
    width: 220,
    height: 220,
    borderWidth: 4,
    borderColor: theme.colors.primary,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  logoBackground: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 50,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  logoBackgroundNoEvent: {
    backgroundColor: theme.colors.primary,
    padding: 4,
  },
  logoLarger: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },
  dropdownContainer: {
    width: "80%",
    marginTop: theme.spacing.large,
  },
  userDetails: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.large,
    padding: theme.spacing.xsmall,
  },
  userDetailsContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: theme.colors.primary,
    width: "80%",
    padding: theme.spacing.small,
    borderColor: theme.colors.primary,
  },
  noteContainer: {
    width: "80%",
    marginTop: theme.spacing.large,
    padding: theme.spacing.small,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  note: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
  },
});
