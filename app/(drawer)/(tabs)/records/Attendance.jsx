import { StyleSheet, Text, View, ScrollView, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { getStoredRecords } from "../../../../database/queries/records";
import theme from "../../../../constants/theme";
import globalStyles from "../../../../constants/globalStyles";
import images from "../../../../constants/images";
import { useLocalSearchParams } from "expo-router";

const SessionLog = ({ label, data }) => {
  return (
    <View style={styles.sessionContainer}>
      <View style={styles.morningTextContainer}>
        <Text style={styles.morningText}>{label}</Text>
      </View>
      <View style={styles.logContainer}>
        <View style={styles.timeContainer}>
          <View
            style={[
              styles.timeLabelContainer,
              { borderRightWidth: 0, borderLeftWidth: 0 },
            ]}
          >
            <Text style={styles.timeLabel}>Time In</Text>
          </View>
          <View style={[styles.imageContainer, { borderLeftWidth: 0 }]}>
            <Image
              source={
                data?.timeIn === "present" ? images.present : images.absent
              }
              style={
                data?.timeIn === "present"
                  ? styles.presentIcon
                  : styles.absentIcon
              }
            />
          </View>
        </View>
        <View style={styles.timeContainer}>
          <View style={[styles.timeLabelContainer, { borderRightWidth: 0 }]}>
            <Text style={styles.timeLabel}>Time Out</Text>
          </View>
          <View style={[styles.imageContainer, { borderRightWidth: 0 }]}>
            <Image
              source={
                data?.timeOut === "present" ? images.present : images.absent
              }
              style={
                data?.timeOut === "present"
                  ? styles.presentIcon
                  : styles.absentIcon
              }
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const Attendance = () => {
  const [attendanceDataList, setAttendanceDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const { eventId } = useLocalSearchParams();

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const records = await getStoredRecords();

        if (records.success && Array.isArray(records.data)) {
          const filteredRecords = records.data.filter(
            (record) => record.event_id.toString() === eventId
          );

          if (filteredRecords.length === 0) {
            return;
          }

          const eventName = filteredRecords[0].event_name;
          setEventName(eventName);

          const formattedData = filteredRecords.reduce((acc, record) => {
            const date = record.event_date;
            const timeInKey = record.am_in ? "present" : "absent";
            const timeOutKey = record.am_out ? "present" : "absent";

            if (!acc[date]) {
              acc[date] = {
                date,
                morning: {
                  timeIn: timeInKey,
                  timeOut: timeOutKey,
                },
                afternoon: {
                  timeIn: record.pm_in ? "present" : "absent",
                  timeOut: record.pm_out ? "present" : "absent",
                },
              };
            }
            return acc;
          }, {});

          const attendanceDataList = Object.values(formattedData);
          setAttendanceDataList(attendanceDataList);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [eventId]);

  if (loading) {
    return (
      <View style={globalStyles.secondaryContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (attendanceDataList.length === 0) {
    return (
      <View style={globalStyles.secondaryContainer}>
        <Text style={styles.noEventsText}>No attendance data available.</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.secondaryContainer}>
      <View style={styles.attendanceWrapper}>
        <Text style={styles.eventTitle}>{eventName}</Text>

        <ScrollView
          contentContainerStyle={styles.scrollviewContainer}
          showsVerticalScrollIndicator={false}
        >
          {attendanceDataList.map((attendanceData, index) => (
            <View key={index} style={styles.attendanceContainer}>
              <View style={styles.dateContainer}>
                <Text style={styles.date}>{attendanceData.date}</Text>
              </View>

              <View style={styles.sessionRow}>
                <View
                  style={{
                    borderRightWidth: 3,
                    borderColor: theme.colors.primary,
                    flex: 1,
                  }}
                >
                  <SessionLog label="Morning" data={attendanceData.morning} />
                </View>
                <View style={{ flex: 1 }}>
                  <SessionLog
                    label="Afternoon"
                    data={attendanceData.afternoon}
                  />
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default Attendance;

const styles = StyleSheet.create({
  attendanceWrapper: {
    flex: 1,
    width: "100%",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  eventTitle: {
    fontSize: theme.fontSizes.huge,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    textAlign: "center",
    paddingVertical: theme.spacing.medium,
  },
  scrollviewContainer: {
    paddingHorizontal: theme.spacing.medium,
  },
  dateContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 3,
    borderColor: theme.colors.primary,
    height: 40,
  },
  date: {
    fontSize: theme.fontSizes.extraLarge,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    textAlign: "center",
  },
  attendanceContainer: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.medium,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sessionContainer: {
    flex: 1,
  },
  morningText: {
    fontSize: theme.fontSizes.extraLarge,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
  },
  morningTextContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  logContainer: {
    flexDirection: "row",
  },
  timeContainer: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
  timeLabelContainer: {
    borderWidth: 3,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderColor: theme.colors.primary,
    height: 50,
  },
  timeLabel: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
  },
  imageContainer: {
    borderLeftWidth: 3,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    borderColor: theme.colors.primary,
  },
  absentIcon: {
    width: 35,
    height: 35,
    tintColor: "red",
  },
  presentIcon: {
    width: 35,
    height: 35,
    tintColor: theme.colors.green,
  },
  loadingText: {
    fontSize: theme.fontSizes.large,
    fontFamily: "SquadaOne",
    color: theme.colors.primary,
    textAlign: "center",
    marginTop: theme.spacing.large,
  },
  noEventsText: {
    fontSize: theme.fontSizes.medium,
    fontFamily: "SquadaOne",
    color: theme.colors.secondary,
    textAlign: "center",
    marginTop: theme.spacing.medium,
  },
});
