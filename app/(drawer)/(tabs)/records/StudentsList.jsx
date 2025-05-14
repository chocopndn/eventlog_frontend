import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchStudentAttendanceByEventAndBlock } from "../../../../services/api/records";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";
import images from "../../../../constants/images";

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { eventId, blockId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchStudentAttendanceByEventAndBlock(
          eventId,
          blockId
        );

        if (response.success) {
          const { data } = response;
          setStudents(data.students || []);
        } else {
          setError(new Error(response.message));
        }

        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (eventId && blockId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [eventId, blockId]);

  const handleStudentPress = (student) => {
    router.push({
      pathname: "/records/Attendance",
      params: {
        eventId,
        blockId,
        studentId: student.student_id,
      },
    });
  };

  if (loading) {
    return (
      <View style={globalStyles.secondaryContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.secondaryContainer}>
      <ScrollView style={{ width: "100%" }}>
        {students.map((student) => (
          <TouchableOpacity
            key={student.student_id}
            style={styles.studentContainer}
            onPress={() => handleStudentPress(student)}
          >
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.name}</Text>
              <Text style={styles.studentId}>{student.student_id}</Text>
            </View>
            <View style={styles.imageContainer}>
              <Image source={images.arrowRight} style={styles.icon} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default StudentsList;

const styles = StyleSheet.create({
  studentContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
    borderWidth: 2,
    height: 50,
    paddingHorizontal: theme.spacing.medium,
    borderColor: theme.colors.primary,
    alignItems: "center",
  },
  studentName: {
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.large,
    color: theme.colors.primary,
  },
  studentId: {
    fontFamily: theme.fontFamily.SquadaOne,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
  },
  icon: {
    height: 24,
    width: 24,
    tintColor: theme.colors.gray,
  },
  imageContainer: {
    justifyContent: "center",
  },
});
