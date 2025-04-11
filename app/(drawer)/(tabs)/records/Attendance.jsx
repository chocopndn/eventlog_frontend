import { StyleSheet, Text, View, ScrollView, Image } from "react-native";
import React from "react";

import theme from "../../../../constants/theme";
import globalStyles from "../../../../constants/globalStyles";
import images from "../../../../constants/images";

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
  const attendanceData = {
    date: "April 7, 2025",
    morning: {
      timeIn: "present",
      timeOut: "absent",
    },
    afternoon: {
      timeIn: "present",
      timeOut: "absent",
    },
  };

  const hasMorning = !!attendanceData.morning;
  const hasAfternoon = !!attendanceData.afternoon;

  return (
    <View style={globalStyles.secondaryContainer}>
      <View style={styles.attendanceWrapper}>
        <Text style={styles.eventTitle}>PRISAA National 2025</Text>

        <ScrollView
          contentContainerStyle={styles.scrollviewContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.attendanceContainer}>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>{attendanceData.date}</Text>
            </View>

            {hasMorning && hasAfternoon ? (
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
            ) : hasMorning ? (
              <SessionLog label="Morning" data={attendanceData.morning} />
            ) : hasAfternoon ? (
              <SessionLog label="Afternoon" data={attendanceData.afternoon} />
            ) : null}
          </View>
          <View style={styles.attendanceContainer}>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>{attendanceData.date}</Text>
            </View>

            {hasMorning && hasAfternoon ? (
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
            ) : hasMorning ? (
              <SessionLog label="Morning" data={attendanceData.morning} />
            ) : hasAfternoon ? (
              <SessionLog label="Afternoon" data={attendanceData.afternoon} />
            ) : null}
          </View>
          <View style={styles.attendanceContainer}>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>{attendanceData.date}</Text>
            </View>

            {hasMorning && hasAfternoon ? (
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
            ) : hasMorning ? (
              <SessionLog label="Morning" data={attendanceData.morning} />
            ) : hasAfternoon ? (
              <SessionLog label="Afternoon" data={attendanceData.afternoon} />
            ) : null}
          </View>
          <View style={styles.attendanceContainer}>
            <View style={styles.dateContainer}>
              <Text style={styles.date}>{attendanceData.date}</Text>
            </View>

            {hasMorning && hasAfternoon ? (
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
            ) : hasMorning ? (
              <SessionLog label="Morning" data={attendanceData.morning} />
            ) : hasAfternoon ? (
              <SessionLog label="Afternoon" data={attendanceData.afternoon} />
            ) : null}
          </View>
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
});
