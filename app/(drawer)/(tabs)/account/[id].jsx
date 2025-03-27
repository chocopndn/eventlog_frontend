import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import globalStyles from "../../../../constants/globalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import theme from "../../../../constants/theme";
import { updateEvent } from "../../../../services/api";
import CustomDropdown from "../../../../components/CustomDropdown";
import FormField from "../../../../components/FormField";
import DatePickerComponent from "../../../../components/DateTimePicker";
import CustomButton from "../../../../components/CustomButton";
import DurationPicker from "../../../../components/DurationPicker";
import CustomModal from "../../../../components/CustomModal";
import { getStoredUser } from "../../../../database/queries";
import {
  useDepartments,
  useBlocksByDepartments,
  useEventNames,
  useEventDetailsById,
} from "../../../../hooks/editEventHooks";

const EditEvent = () => {
  const { id } = useLocalSearchParams();
  const { departmentsData, loadingDepartments, errorDepartments } =
    useDepartments();
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const { blocksData, loadingBlocks, errorBlocks } =
    useBlocksByDepartments(selectedDepartments);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const { eventNamesData, loadingEventNames, errorEventNames } =
    useEventNames();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { eventData, isLoadingEventDetails, errorFetchingEventDetails } =
    useEventDetailsById(id);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDates, setSelectedDates] = useState([]);
  const [amIn, setAmIn] = useState(null);
  const [amOut, setAmOut] = useState(null);
  const [pmIn, setPmIn] = useState(null);
  const [pmOut, setPmOut] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [isDurationPickerVisible, setDurationPickerVisible] = useState(false);
  const [adminId, setAdminId] = useState(null);
  const [updatingEvent, setUpdatingEvent] = useState(false);
  const [hasLoadedEventData, setHasLoadedEventData] = useState(false);

  useEffect(() => {
    const loadAdminId = async () => {
      try {
        const user = await getStoredUser();
        if (user?.id_number) {
          setAdminId(user.id_number);
        }
      } catch (error) {
        console.error("EditEvent: Error loading admin ID:", error);
      }
    };
    loadAdminId();
  }, []);

  useEffect(() => {
    if (eventData && !hasLoadedEventData) {
      setSelectedEvent({
        label: eventData.event_name,
        value: eventData.event_name_id,
      });
      setVenue(eventData.venue);
      setDescription(eventData.description);

      let initialDepartments = [];
      if (eventData.department_ids) {
        if (typeof eventData.department_ids === "string") {
          initialDepartments = eventData.department_ids.split(",").map(Number);
        } else if (Array.isArray(eventData.department_ids)) {
          initialDepartments = eventData.department_ids.map(Number);
        }
      }
      setSelectedDepartments(initialDepartments);

      let initialBlocks = [];
      if (eventData.block_ids) {
        try {
          const parsedBlocks = JSON.parse(eventData.block_ids);
          if (Array.isArray(parsedBlocks)) {
            initialBlocks = parsedBlocks.map(Number);
          } else if (
            typeof eventData.block_ids === "string" &&
            eventData.block_ids.startsWith("[") &&
            eventData.block_ids.endsWith("]")
          ) {
            const idsString = eventData.block_ids.slice(1, -1);
            initialBlocks = idsString.split(",").map(Number).filter(Boolean);
          }
        } catch (error) {
          console.error(
            "EditEvent: Error parsing block_ids:",
            error,
            eventData.block_ids
          );
        }
      }
      setSelectedBlocks(initialBlocks);

      if (eventData.dates && eventData.all_dates) {
        setSelectedDates([new Date(eventData.all_dates)]);
      }
      setSelectedDuration(eventData.duration);
      const createTimeDate = (timeStr) => {
        if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":"))
          return null;
        const [hours, minutes, seconds] = timeStr.split(":").map(Number);
        if (isNaN(hours) || isNaN(minutes) || (seconds && isNaN(seconds)))
          return null;
        const date = new Date();
        date.setHours(hours, minutes, seconds || 0, 0);
        return date;
      };
      setAmIn(createTimeDate(eventData.am_in));
      setAmOut(createTimeDate(eventData.am_out));
      setPmIn(createTimeDate(eventData.pm_in));
      setPmOut(createTimeDate(eventData.pm_out));
      setHasLoadedEventData(true);
    } else if (!eventData && hasLoadedEventData) {
      setHasLoadedEventData(false);
    }
  }, [eventData, hasLoadedEventData]);

  const showModal = (title, message, type = "error") => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const formatTime = (time) => {
    if (time instanceof Date) {
      return time.toTimeString().substring(0, 8);
    }
    return "";
  };

  const handleUpdateEvent = async () => {
    if (!selectedEvent?.value) {
      showModal("Error", "Please select an event name");
      return;
    }
    if (!venue.trim()) {
      showModal("Error", "Please enter a venue");
      return;
    }
    if (selectedDates.length === 0) {
      showModal("Error", "Please select a date");
      return;
    }
    if (!adminId) {
      showModal("Error", "Admin ID not found");
      return;
    }
    if (selectedDuration <= 0) {
      showModal("Error", "Please select a valid duration.");
      return;
    }
    setUpdatingEvent(true);
    try {
      const updateData = {
        event_name_id: selectedEvent.value,
        venue,
        description,
        department_id: selectedDepartments,
        block_ids: selectedBlocks,
        date: selectedDates.map((date) => date.toISOString().split("T")[0]),
        am_in: formatTime(amIn),
        am_out: formatTime(amOut),
        pm_in: formatTime(pmIn),
        pm_out: formatTime(pmOut),
        duration: selectedDuration,
        admin_id_number: adminId,
      };
      const response = await updateEvent(id, updateData);
      if (response?.success) {
        showModal("Success", "Event updated successfully!", "success");
      } else {
        showModal("Error", response?.message || "Update failed", "error");
      }
    } catch (error) {
      console.error("EditEvent: Update error:", error);
      showModal(
        "Error",
        error.response?.data?.message || error.message || "Update failed"
      );
    } finally {
      setUpdatingEvent(false);
    }
  };

  const handleAmInChange = (newTime) => {
    setAmIn(newTime);
  };

  const handleAmOutChange = (newTime) => {
    setAmOut(newTime);
  };

  const handlePmInChange = (newTime) => {
    setPmIn(newTime);
  };

  const handlePmOutChange = (newTime) => {
    setPmOut(newTime);
  };

  if (isLoadingEventDetails || loadingDepartments || loadingEventNames) {
    return (
      <View style={globalStyles.secondaryContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.secondaryContainer, { paddingTop: 0 }]}>
      <Text style={styles.title}>EVENTLOG</Text>
      <View style={styles.formWrapper}>
        <View style={styles.eventTitleWrapper}>
          <Text style={styles.addEventTitle}>EDIT EVENT</Text>
        </View>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={styles.scrollviewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: "100%" }}>
            {loadingDepartments ? (
              <ActivityIndicator size="small" />
            ) : errorDepartments ? (
              <Text style={{ color: "red" }}>Error loading departments</Text>
            ) : (
              <CustomDropdown
                placeholder="Select Department"
                title="Department"
                data={departmentsData?.map((dept) => ({
                  label: dept.label,
                  value: dept.value,
                }))}
                display="sharp"
                onSelect={setSelectedDepartments}
                value={selectedDepartments}
                multiSelect={true}
              />
            )}
            {loadingBlocks ? (
              <ActivityIndicator size="small" />
            ) : errorBlocks ? (
              <Text style={{ color: "red" }}>Error loading blocks</Text>
            ) : (
              <CustomDropdown
                title="Block/s Included"
                data={blocksData?.map((block) => ({
                  label: block.label,
                  value: block.value,
                }))}
                display="sharp"
                onSelect={setSelectedBlocks}
                value={selectedBlocks}
                placeholder={
                  blocksData?.length ? "Select Block/s" : "No Blocks Available"
                }
                multiSelect={true}
              />
            )}
            {loadingEventNames ? (
              <ActivityIndicator size="small" />
            ) : errorEventNames ? (
              <Text style={{ color: "red" }}>Error loading event names</Text>
            ) : (
              <CustomDropdown
                title="Name of Event"
                data={eventNamesData?.map((event) => ({
                  label: event.label,
                  value: event.value,
                }))}
                display="sharp"
                onSelect={setSelectedEvent}
                value={selectedEvent}
                placeholder="Select Event"
              />
            )}
            {isLoadingEventDetails ? (
              <ActivityIndicator size="small" />
            ) : errorFetchingEventDetails ? (
              <Text style={{ color: "red" }}>Error loading event details</Text>
            ) : (
              <>
                <FormField
                  type="text"
                  borderColor="primary"
                  title="Venue"
                  design="sharp"
                  value={venue}
                  onChangeText={setVenue}
                />
                <FormField
                  type="text"
                  borderColor="primary"
                  title="Description"
                  design="sharp"
                  multiline={true}
                  value={description}
                  onChangeText={setDescription}
                />
                <DatePickerComponent
                  type="date"
                  title="Date of Event"
                  onDateChange={setSelectedDates}
                  selectedValue={selectedDates}
                  mode="multiple"
                />
                <View style={styles.dateTimeWrapper}>
                  <Text style={styles.timeOfDay}>Morning</Text>
                  <View style={styles.timePickerContainer}>
                    <View style={{ width: "48%" }}>
                      <DatePickerComponent
                        type="time"
                        label="TIME IN"
                        onDateChange={handleAmInChange}
                        selectedValue={amIn}
                      />
                    </View>
                    <View style={{ width: "48%" }}>
                      <DatePickerComponent
                        type="time"
                        label="TIME OUT"
                        onDateChange={handleAmOutChange}
                        selectedValue={amOut}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.dateTimeWrapper}>
                  <Text style={styles.timeOfDay}>Afternoon</Text>
                  <View style={styles.timePickerContainer}>
                    <View style={{ width: "48%" }}>
                      <DatePickerComponent
                        type="time"
                        label="TIME IN"
                        onDateChange={handlePmInChange}
                        selectedValue={pmIn}
                      />
                    </View>
                    <View style={{ width: "48%" }}>
                      <DatePickerComponent
                        type="time"
                        label="TIME OUT"
                        onDateChange={handlePmOutChange}
                        selectedValue={pmOut}
                      />
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.duration}
                  onPress={() => setDurationPickerVisible(true)}
                >
                  <Text style={styles.durationText}>
                    Select Duration: {selectedDuration} minutes
                  </Text>
                </TouchableOpacity>
                <DurationPicker
                  visible={isDurationPickerVisible}
                  onClose={() => setDurationPickerVisible(false)}
                  onDurationSelect={setSelectedDuration}
                />
              </>
            )}
            <View style={styles.buttonContainer}>
              <CustomButton
                title="UPDATE"
                onPress={handleUpdateEvent}
                loading={updatingEvent}
              />
            </View>
          </View>
        </ScrollView>
      </View>
      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        onClose={() => setModalVisible(false)}
      />
      <StatusBar style="light" />
    </SafeAreaView>
  );
};

export default EditEvent;

const styles = StyleSheet.create({
  title: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.display,
  },
  formWrapper: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    width: "90%",
    marginBottom: theme.spacing.medium,
    alignItems: "center",
  },
  scrollviewContent: {
    alignItems: "center",
    padding: theme.spacing.medium,
  },
  addEventTitle: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.huge,
  },
  eventTitleWrapper: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    width: "100%",
    alignItems: "center",
  },
  timePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeOfDay: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
  },
  dateTimeWrapper: {
    marginTop: theme.spacing.medium,
  },
  buttonContainer: {
    marginTop: theme.spacing.medium,
  },
  duration: {
    width: "100%",
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginTop: theme.spacing.medium,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  durationText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
  },
});
