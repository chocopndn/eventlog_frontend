import { StyleSheet, Text, View, SafeAreaView, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect } from "expo-router";

import TabsComponent from "../../../../components/TabsComponent";
import CustomButton from "../../../../components/CustomButton";
import CustomModal from "../../../../components/CustomModal";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import { fetchEventNameById, deleteEventName } from "../../../../services/api";
import { useLocalSearchParams } from "expo-router";

const EventNameDetails = () => {
  const { id: eventNameId } = useLocalSearchParams();
  const [eventNameDetails, setEventNameDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const fetchEventNameDetails = async () => {
    try {
      if (!eventNameId) throw new Error("Invalid event name ID");

      const eventNameData = await fetchEventNameById(eventNameId);

      if (!eventNameData || !eventNameData.data) {
        throw new Error("Event name details not found");
      }

      setEventNameDetails(eventNameData.data);
    } catch (error) {
      console.error(error.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      fetchEventNameDetails();
    }, [eventNameId])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!eventNameDetails) {
    return (
      <SafeAreaView style={globalStyles.secondaryContainer}>
        <Text style={styles.errorText}>Event name details not found.</Text>
      </SafeAreaView>
    );
  }

  const handleDeletePress = () => {
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEventName(eventNameDetails.id);
      setIsSuccessModalVisible(true);
    } catch (error) {
      console.error(error.message || error);
    } finally {
      setIsDeleteModalVisible(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        globalStyles.secondaryContainer,
        { paddingTop: 0, paddingBottom: 110 },
      ]}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Event Name Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.detailsWrapper}>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Event Name:</Text>
          <Text style={styles.detail}>{eventNameDetails.name}</Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailTitle}>Status:</Text>
          <Text style={styles.detail}>{eventNameDetails.status || "-"}</Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <CustomButton
            title="EDIT"
            onPress={() =>
              router.push(
                `/eventManagement/eventnames/EditEventName?id=${eventNameDetails.id}`
              )
            }
          />
        </View>
        {eventNameDetails.status === "deleted" ? null : (
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
        message={`Are you sure you want to delete ${eventNameDetails.name}?`}
        type="warning"
        onClose={() => setIsDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        cancelTitle="Cancel"
        confirmTitle="Delete"
      />

      <CustomModal
        visible={isSuccessModalVisible}
        title="Success"
        message={`${eventNameDetails.name} has been deleted successfully.`}
        type="success"
        onClose={() => {
          setIsSuccessModalVisible(false);
          router.back();
        }}
        cancelTitle="Close"
      />

      <TabsComponent />
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default EventNameDetails;

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
