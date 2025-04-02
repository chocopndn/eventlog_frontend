import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import TabsComponent from "../../../../components/TabsComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { fetchEventNames, deleteEventName } from "../../../../services/api";
import { router, useFocusEffect } from "expo-router";
import images from "../../../../constants/images";
import SearchBar from "../../../../components/CustomSearch";
import CustomModal from "../../../../components/CustomModal";
import CustomButton from "../../../../components/CustomButton";
import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

export default function EventNamesScreen() {
  const [eventNames, setEventNames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [eventNameToDelete, setEventNameToDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadEventNames = async () => {
    try {
      const fetchedEventNames = await fetchEventNames();
      setEventNames(Array.isArray(fetchedEventNames) ? fetchedEventNames : []);
    } catch (err) {}
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadEventNames();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadEventNames();
    }, [])
  );

  const filteredEventNames = Array.isArray(eventNames)
    ? eventNames.filter((eventName) => {
        const eventNameText = eventName.label?.toLowerCase() || "";
        return eventNameText.includes(searchQuery.toLowerCase());
      })
    : [];

  const handleDeletePress = (eventName) => {
    if (!eventName || !eventName.label) return;
    setEventNameToDelete(eventName);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalVisible(false);
    setEventNameToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!eventNameToDelete) return;
    try {
      await deleteEventName(eventNameToDelete.value);
      setEventNames((prevEventNames) =>
        prevEventNames.map((eventName) =>
          eventName.value === eventNameToDelete.value
            ? { ...eventName, status: "deleted" }
            : eventName
        )
      );
      handleDeleteModalClose();
      setIsSuccessModalVisible(true);
    } catch (error) {}
  };

  return (
    <SafeAreaView style={[globalStyles.secondaryContainer, { paddingTop: 0 }]}>
      <Text style={styles.headerText}>EVENT NAMES</Text>
      <View style={{ paddingHorizontal: theme.spacing.medium, width: "100%" }}>
        <SearchBar
          placeholder="Search event names..."
          onSearch={setSearchQuery}
        />
      </View>
      <ScrollView
        style={{ flex: 1, width: "100%", marginBottom: 70 }}
        contentContainerStyle={[styles.scrollview, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        {filteredEventNames.length > 0 ? (
          filteredEventNames.map((eventName) => (
            <TouchableOpacity
              key={eventName.value}
              style={styles.eventNameContainer}
              onPress={() =>
                router.push(
                  `/eventManagement/eventnames/EventNameDetails?id=${eventName.value}`
                )
              }
            >
              <View style={styles.textContainer}>
                <Text style={styles.name} numberOfLines={1}>
                  {eventName.label}
                </Text>
                <Text style={styles.status} numberOfLines={1}>
                  {eventName.status}
                </Text>
              </View>
              <View style={styles.iconContainer}>
                <TouchableOpacity
                  onPress={() => {
                    if (eventName.value) {
                      router.push(
                        `/eventManagement/eventnames/EditEventName?id=${eventName.value}`
                      );
                    }
                  }}
                >
                  <Image source={images.edit} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeletePress(eventName)}
                  disabled={eventName.status === "deleted"}
                  style={{ opacity: eventName.status === "deleted" ? 0.5 : 1 }}
                >
                  <Image source={images.trash} style={styles.icon} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noResults}>No event names found</Text>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="ADD EVENT NAME"
          onPress={() =>
            router.push("/eventManagement/eventnames/AddEventName")
          }
        />
      </View>

      <CustomModal
        visible={isDeleteModalVisible}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${eventNameToDelete?.label}?`}
        type="warning"
        onClose={handleDeleteModalClose}
        onConfirm={handleConfirmDelete}
        cancelTitle="Cancel"
        confirmTitle="Delete"
      />

      <CustomModal
        visible={isSuccessModalVisible}
        title="Success"
        message="Event name deleted successfully!"
        type="success"
        onClose={() => setIsSuccessModalVisible(false)}
        cancelTitle="CLOSE"
      />

      <TabsComponent />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: 65,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
  },
  eventNameContainer: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    flexDirection: "row",
    height: 50,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.small,
    marginBottom: theme.spacing.small,
  },
  textContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  scrollview: {
    padding: theme.spacing.medium,
    flexGrow: 1,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: theme.colors.primary,
    marginLeft: theme.spacing.small,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.large,
    flexShrink: 1,
  },
  status: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    flexShrink: 1,
  },
  noResults: {
    textAlign: "center",
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.medium,
    marginTop: theme.spacing.medium,
  },
  buttonContainer: {
    position: "absolute",
    bottom: theme.spacing.medium,
    alignSelf: "center",
    width: "80%",
    padding: theme.spacing.medium,
    marginBottom: 80,
  },
});
