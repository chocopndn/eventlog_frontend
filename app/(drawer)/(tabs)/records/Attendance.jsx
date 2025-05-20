import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import theme from "../../../../constants/theme";
import globalStyles from "../../../../constants/globalStyles";
import images from "../../../../constants/images";
import { useLocalSearchParams } from "expo-router";
import moment from "moment";
import CustomButton from "../../../../components/CustomButton";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import CustomModal from "../../../../components/CustomModal";
import { fetchStudentAttendanceByEventAndBlock } from "../../../../services/api/records";
import { getStudentAttSummary } from "../../../../services/api/records";

const SessionLog = ({ label, data }) => (
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
            source={data?.timeIn === "present" ? images.present : images.absent}
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

const Attendance = () => {
  const [attendanceDataList, setAttendanceDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const { eventId, blockId, studentId } = useLocalSearchParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "success",
    cancelTitle: "OK",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchStudentAttendanceByEventAndBlock(
          eventId,
          blockId,
          studentId
        );
        if (response.success) {
          const { data } = response;
          const student = data.students.find((s) => s.student_id === studentId);
          if (student) {
            setEventName(data.event_name);
            setStudentDetails({
              name: student.name,
              id: student.student_id,
              courseBlock: `${data.course_code} ${data.block_name}`,
            });
            const formattedData = student.dates.reduce((acc, dateData) => {
              const formattedDate = moment(dateData.date).format(
                "MMMM D, YYYY"
              );
              const hasPM =
                Boolean(dateData.attendance.pm_in) ||
                Boolean(dateData.attendance.pm_out);
              acc[formattedDate] = {
                date: formattedDate,
                morning: {
                  timeIn: dateData.attendance.am_in ? "present" : "absent",
                  timeOut: dateData.attendance.am_out ? "present" : "absent",
                },
                afternoon: {
                  timeIn: dateData.attendance.pm_in ? "present" : "absent",
                  timeOut: dateData.attendance.pm_out ? "present" : "absent",
                  hasPM,
                },
              };
              return acc;
            }, {});
            setAttendanceDataList(Object.values(formattedData));
          } else {
            setEventName("");
            setStudentDetails(null);
            setAttendanceDataList([]);
          }
        } else {
          setEventName("");
          setStudentDetails(null);
          setAttendanceDataList([]);
        }
      } catch (error) {
        setEventName("");
        setStudentDetails(null);
        setAttendanceDataList([]);
      } finally {
        setLoading(false);
      }
    };
    if (eventId && blockId && studentId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [eventId, blockId, studentId]);

  const handlePrint = async () => {
    try {
      setModalConfig({
        title: "Generating PDF",
        message: "Please wait...",
        type: "loading",
        cancelTitle: null,
      });
      setModalVisible(true);
      const response = await getStudentAttSummary(eventId, studentId);
      if (!response?.success || !response.data) {
        throw new Error("Failed to fetch student data.");
      }
      const { event_name, student_id, student_name, attendance_summary } =
        response.data;
      const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: sans-serif; padding: 20px; }
            h1 { color: #333; text-align: center; }
            .info { margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #999; padding: 8px; text-align: left; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #aaa; }
          </style>
        </head>
        <body>
          <h1>${event_name || "Unknown Event"}</h1>
          <div class="info">
            <p><strong>Name:</strong> ${student_name || "N/A"}</p>
            <p><strong>ID:</strong> ${student_id || "N/A"}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Present</th>
                <th>Absent</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(attendance_summary)
                .map(
                  ([date, { present_count, absent_count }]) => `
                  <tr>
                    <td>${moment(date).format("MMMM D, YYYY")}</td>
                    <td>${present_count}</td>
                    <td>${absent_count}</td>
                  </tr>
                `
                )
                .join("")}
            </tbody>
          </table>
          <div class="footer">
            Generated on ${moment().format("MMMM D, YYYY hh:mm A")}
          </div>
        </body>
      </html>
    `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const pdfName = `${student_name || "Student"} - ${
        event_name || "Event"
      }.pdf`;
      const pdfPath = `${FileSystem.documentDirectory}${pdfName}`;
      await FileSystem.moveAsync({ from: uri, to: pdfPath });
      await Sharing.shareAsync(pdfPath, {
        mimeType: "application/pdf",
        UTI: ".pdf",
      });
      setModalConfig({
        title: "Download Successful",
        message: "Your PDF has been downloaded successfully.",
        type: "success",
        cancelTitle: "OK",
      });
    } catch (error) {
      setModalConfig({
        title: "Download Failed",
        message: "An error occurred while generating the PDF.",
        type: "error",
        cancelTitle: "OK",
      });
    } finally {
      setModalVisible(true);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.secondaryContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!eventName || !studentDetails || attendanceDataList.length === 0) {
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
        <View style={styles.fullContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollviewContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.infoContainer}>
              <Text style={styles.info}>Name: {studentDetails.name}</Text>
              <Text style={styles.info}>ID: {studentDetails.id}</Text>
              <Text style={styles.info}>
                Course/Block: {studentDetails.courseBlock}
              </Text>
            </View>
            {attendanceDataList.map((attendanceData, index) => (
              <View key={index} style={styles.attendanceContainer}>
                <View style={styles.dateContainer}>
                  <Text style={styles.date}>{attendanceData.date}</Text>
                </View>
                <View style={styles.sessionRow}>
                  <View
                    style={{
                      flex: 1,
                      borderRightWidth: 3,
                      borderColor: theme.colors.primary,
                    }}
                  >
                    <SessionLog label="Morning" data={attendanceData.morning} />
                  </View>
                  {attendanceData.afternoon.hasPM && (
                    <View style={{ flex: 1 }}>
                      <SessionLog
                        label="Afternoon"
                        data={attendanceData.afternoon}
                      />
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <CustomButton title="Download" onPress={handlePrint} />
          </View>
        </View>
      </View>
      <CustomModal
        visible={modalVisible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        cancelTitle={modalConfig.cancelTitle}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
};

export default Attendance;

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  buttonContainer: {
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
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
    paddingBottom: theme.spacing.large,
  },
  infoContainer: {
    paddingHorizontal: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  info: {
    fontSize: theme.fontSizes.large,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    marginTop: theme.spacing.xsmall,
  },
  attendanceContainer: {
    borderWidth: 3,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.medium,
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
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    textAlign: "center",
    marginTop: theme.spacing.large,
  },
  noEventsText: {
    fontSize: theme.fontSizes.medium,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.secondary,
    textAlign: "center",
    marginTop: theme.spacing.medium,
  },
});
