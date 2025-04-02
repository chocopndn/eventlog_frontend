import { StyleSheet, Text, View, SafeAreaView, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect } from "expo-router";

import TabsComponent from "../../../../components/TabsComponent";
import CustomButton from "../../../../components/CustomButton";
import CustomModal from "../../../../components/CustomModal";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import { fetchEventById, deleteEvent } from "../../../../services/api";
import { useLocalSearchParams } from "expo-router";

const EventDetails = () => {
  const { id: eventId } = useLocalSearchParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const fetchEventDetails = async () => {
    try {
      if (!eventId) throw new Error("Invalid event ID");

      const eventData = await fetchEventById(eventId);
      if (!eventData) throw new Error("Event details not found");

      setEventDetails(eventData);
    } catch (error) {
      console.error(error.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      fetchEventDetails();
    }, [eventId])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!eventDetails) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <Text style={styles.errorText}>Event details not found.</Text>
      </SafeAreaView>
    );
  }

  const handleDeletePress = () => {
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEvent(eventDetails.event_id);
      router.back();
    } catch (error) {
      console.error(error.message || error);
    } finally {
      setIsDeleteModalVisible(false);
    }
  };

  const formatColumnData = (data, separator = ",") => {
    if (!data) return "-";
    const items = data.split(separator).map((item) => item.trim());
    return items.map((item, index) => (
      <Text key={index} style={styles.columnItem}>
        {item}
      </Text>
    ));
  };

  return (
    <SafeAreaView
      style={[
        globalStyles.secondaryContainer,
        { paddingTop: 0, paddingBottom: 110 },
      ]}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Event Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.detailsWrapper}>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Event Name:</Text>
          <Text style={styles.detail}>{eventDetails.event_name || "-"}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Description:</Text>
          <Text style={styles.detail}>{eventDetails.description || "-"}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Venue:</Text>
          <Text style={styles.detail}>{eventDetails.venue || "-"}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Created By:</Text>
          <Text style={styles.detail}>
            {eventDetails.created_by_admin_name || "-"}
          </Text>
        </View>

        {eventDetails.status !== "pending" && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailTitle}>Approved By:</Text>
            <Text style={styles.detail}>
              {eventDetails.approved_by_admin_name || "-"}
            </Text>
          </View>
        )}

        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Event Dates:</Text>
          <View style={styles.columnContainer}>
            {formatColumnData(eventDetails.event_dates)}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Event Blocks:</Text>
          <View style={styles.columnContainer}>
            {formatColumnData(eventDetails.block_names)}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>AM In:</Text>
          <Text style={styles.detail}>{eventDetails.am_in || "-"}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>AM Out:</Text>
          <Text style={styles.detail}>{eventDetails.am_out || "-"}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>PM In:</Text>
          <Text style={styles.detail}>{eventDetails.pm_in || "-"}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>PM Out:</Text>
          <Text style={styles.detail}>{eventDetails.pm_out || "-"}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Scan Personnel:</Text>
          <Text style={styles.detail}>
            {eventDetails.scan_personnel || "-"}
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Status:</Text>
          <Text style={styles.detail}>{eventDetails.status || "-"}</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <CustomButton
            title="EDIT"
            onPress={() =>
              router.push(
                `/eventManagement/events/EditEvent?id=${eventDetails.event_id}`
              )
            }
          />
        </View>

        {eventDetails.status !== "deleted" && (
          <View style={styles.button}>
            <CustomButton
              title="DELETE"
              type="secondary"
              onPress={handleDeletePress}
            />
          </View>
        )}
      </View>

      <CustomModal
        visible={isDeleteModalVisible}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${eventDetails.event_name}?`}
        type="warning"
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        cancelTitle="Cancel"
        confirmTitle="Delete"
      />

      <TabsComponent />
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default EventDetails;

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fontSizes.huge,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
  },
  detailsWrapper: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
  },
  button: {
    marginHorizontal: theme.spacing.small,
    flex: 1,
  },
  detailsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.small,
  },
  detailTitle: {
    fontFamily: theme.fontFamily.ArialBold,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
    width: "40%",
    flexShrink: 1,
  },
  detail: {
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
    width: "60%",
    flexShrink: 1,
  },
  columnContainer: {
    flexDirection: "column",
    width: "60%",
  },
  columnItem: {
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  loadingText: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fontFamily.Regular,
    color: theme.colors.primary,
    textAlign: "center",
    marginTop: theme.spacing.medium,
  },
  errorText: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fontFamily.Regular,
    color: theme.colors.error,
    textAlign: "center",
    marginTop: theme.spacing.medium,
  },
});
