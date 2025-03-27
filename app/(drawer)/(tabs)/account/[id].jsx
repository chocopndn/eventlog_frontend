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
import axios from "axios";
import { API_URL } from "../../../../config/config";
import globalStyles from "../../../../constants/globalStyles";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import theme from "../../../../constants/theme";

import CustomDropdown from "../../../../components/CustomDropdown";
import FormField from "../../../../components/FormField";
import DatePickerComponent from "../../../../components/DateTimePicker";
import CustomButton from "../../../../components/CustomButton";
import DurationPicker from "../../../../components/DurationPicker";
import CustomModal from "../../../../components/CustomModal";
import { getStoredUser } from "../../../../database/queries";

const EditEvent = () => {
  const { id } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingEventNames, setLoadingEventNames] = useState(true);

  const [errorDepartments, setErrorDepartments] = useState(null);
  const [errorBlocks, setErrorBlocks] = useState(null);
  const [errorEventNames, setErrorEventNames] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("");

  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [eventNames, setEventNames] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
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

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/departments`);
        if (response.data.success) {
          setDepartments(
            response.data.departments.map((dept) => ({
              label: dept.department_code,
              value: dept.department_id,
            }))
          );
        }
      } catch (error) {
        setErrorDepartments(error);
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchBlocks = async () => {
      if (selectedDepartments.length === 0) return;

      try {
        setLoadingBlocks(true);
        const responses = await Promise.all(
          selectedDepartments.map((deptId) =>
            axios.get(`${API_URL}/api/blocks/${deptId}`)
          )
        );

        const allBlocks = responses.flatMap((res) =>
          res.data.success ? res.data.data : []
        );

        setBlocks(
          allBlocks.map((block) => ({
            label: block.name,
            value: block.id,
          }))
        );
      } catch (error) {
        setErrorBlocks(error);
      } finally {
        setLoadingBlocks(false);
      }
    };
    fetchBlocks();
  }, [selectedDepartments]);

  useEffect(() => {
    const fetchEventNames = async () => {
      try {
        setLoadingEventNames(true);
        const response = await axios.get(`${API_URL}/api/events/names`);

        if (response.data && response.data.success) {
          const eventsData = response.data.eventNames || response.data.data;
          if (Array.isArray(eventsData)) {
            setEventNames(
              eventsData.map((event) => ({
                label: event.name || event.event_name,
                value: event.id || event.event_name_id,
              }))
            );
          } else {
            throw new Error("Invalid event names data format");
          }
        } else {
          throw new Error(
            response.data?.message || "Failed to fetch event names"
          );
        }
      } catch (error) {
        console.error("Error fetching event names:", error);
        setErrorEventNames(error);
        showModal("Error", "Failed to load event names");
      } finally {
        setLoadingEventNames(false);
      }
    };

    fetchEventNames();
  }, []);

  useEffect(() => {
    const loadAdminId = async () => {
      const user = await getStoredUser();
      if (user?.id_number) {
        setAdminId(user.id_number);
      }
    };
    loadAdminId();
  }, []);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/events/${id}`);

        if (response.data.success) {
          const event = response.data.event;

          setSelectedEvent({
            label: event.event_name,
            value: event.event_name_id,
          });
          setVenue(event.venue);
          setDescription(event.description);
          setSelectedDepartments(
            event.departments?.map((d) => d.department_id) || []
          );
          setSelectedBlocks(event.blocks?.map((b) => b.id) || []);
          setSelectedDates([new Date(event.date)]);
          setSelectedDuration(event.duration);

          const createTimeDate = (timeStr) => {
            if (!timeStr) return null;
            const [hours, minutes, seconds] = timeStr.split(":");
            const date = new Date();
            date.setHours(hours, minutes, seconds);
            return date;
          };

          setAmIn(createTimeDate(event.am_in));
          setAmOut(createTimeDate(event.am_out));
          setPmIn(createTimeDate(event.pm_in));
          setPmOut(createTimeDate(event.pm_out));
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        showModal("Error", "Failed to load event data");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const showModal = (title, message, type = "error") => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
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

    const formatTime = (time) => {
      if (!time) return "";
      return time.toTimeString().substring(0, 8);
    };

    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/api/events/${id}`, {
        event_name_id: selectedEvent.value,
        venue,
        description,
        department_id: selectedDepartments,
        block_ids: selectedBlocks,
        date: selectedDates[0].toISOString().split("T")[0],
        am_in: formatTime(amIn),
        am_out: formatTime(amOut),
        pm_in: formatTime(pmIn),
        pm_out: formatTime(pmOut),
        duration: selectedDuration,
        admin_id_number: adminId,
      });

      if (response.data.success) {
        showModal("Success", "Event updated successfully!", "success");
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (error) {
      showModal(
        "Error",
        error.response?.data?.message || error.message || "Update failed"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
            ) : (
              <CustomDropdown
                placeholder="Select Department"
                title="Department"
                data={departments}
                display="sharp"
                onSelect={setSelectedDepartments}
                value={selectedDepartments}
                multiSelect={true}
              />
            )}

            {loadingBlocks ? (
              <ActivityIndicator size="small" />
            ) : (
              <CustomDropdown
                title="Block/s Included"
                data={blocks}
                display="sharp"
                onSelect={setSelectedBlocks}
                value={selectedBlocks}
                placeholder={
                  blocks.length ? "Select Block/s" : "No Blocks Available"
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
                data={eventNames}
                display="sharp"
                onSelect={setSelectedEvent}
                value={selectedEvent}
                placeholder="Select Event"
              />
            )}

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
            />

            <View style={styles.dateTimeWrapper}>
              <Text style={styles.timeOfDay}>Morning</Text>
              <View style={styles.timePickerContainer}>
                <View style={{ width: "48%" }}>
                  <DatePickerComponent
                    type="time"
                    label="TIME IN"
                    onDateChange={setAmIn}
                    selectedValue={amIn}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <DatePickerComponent
                    type="time"
                    label="TIME OUT"
                    onDateChange={setAmOut}
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
                    onDateChange={setPmIn}
                    selectedValue={pmIn}
                  />
                </View>
                <View style={{ width: "48%" }}>
                  <DatePickerComponent
                    type="time"
                    label="TIME OUT"
                    onDateChange={setPmOut}
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

            <View style={styles.buttonContainer}>
              <CustomButton
                title="UPDATE"
                onPress={handleUpdateEvent}
                loading={loading}
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
