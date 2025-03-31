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
import TabsComponent from "../../../components/TabsComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { fetchCourses, deleteCourse } from "../../../services/api";
import { router, useFocusEffect } from "expo-router";

import images from "../../../constants/images";
import SearchBar from "../../../components/CustomSearch";
import CustomModal from "../../../components/CustomModal";
import CustomButton from "../../../components/CustomButton";

import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";

export default function CoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadCourses = async () => {
    try {
      const fetchedCourses = await fetchCourses();
      setCourses(Array.isArray(fetchedCourses) ? fetchedCourses : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadCourses();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadCourses();
    }, [])
  );

  const filteredCourses = Array.isArray(courses)
    ? courses.filter((course) => {
        const courseName = course.course_name?.toLowerCase() || "";
        const departmentName = course.department_name?.toLowerCase() || "";
        return (
          courseName.includes(searchQuery.toLowerCase()) ||
          departmentName.includes(searchQuery.toLowerCase())
        );
      })
    : [];

  const handleDeletePress = (course) => {
    setCourseToDelete(course);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalVisible(false);
    setCourseToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      await deleteCourse(courseToDelete.course_id);

      setCourses((prevCourses) =>
        prevCourses.filter(
          (course) => course.course_id !== courseToDelete.course_id
        )
      );

      handleDeleteModalClose();
      setIsSuccessModalVisible(true);
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  return (
    <SafeAreaView style={[globalStyles.secondaryContainer, { paddingTop: 0 }]}>
      <Text style={styles.headerText}>COURSES</Text>
      <View style={{ paddingHorizontal: theme.spacing.medium, width: "100%" }}>
        <SearchBar placeholder="Search courses..." onSearch={setSearchQuery} />
      </View>
      <ScrollView
        style={{ flex: 1, width: "100%", marginBottom: 70 }}
        contentContainerStyle={[styles.scrollview, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <TouchableOpacity
              key={course.course_id}
              style={styles.courseContainer}
              onPress={() =>
                router.push(`/courses/CourseDetails?id=${course.course_id}`)
              }
            >
              <View style={styles.textContainer}>
                <Text style={styles.name} numberOfLines={1}>
                  {course.course_name}
                </Text>
                <Text style={styles.departmentName} numberOfLines={1}>
                  {course.department_name}
                </Text>
              </View>

              <View style={styles.iconContainer}>
                <TouchableOpacity
                  onPress={() => {
                    if (course.course_id) {
                      router.push(`/courses/EditCourse?id=${course.course_id}`);
                    }
                  }}
                >
                  <Image source={images.edit} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePress(course)}>
                  <Image source={images.trash} style={styles.icon} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noResults}>No courses found</Text>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="ADD COURSE"
          onPress={() => router.push("/courses/AddCourse")}
        />
      </View>

      <CustomModal
        visible={isDeleteModalVisible}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${courseToDelete?.course_name}?`}
        type="warning"
        onClose={handleDeleteModalClose}
        onConfirm={handleConfirmDelete}
        cancelTitle="Cancel"
        confirmTitle="Delete"
      />

      <CustomModal
        visible={isSuccessModalVisible}
        title="Success"
        message="Course deleted successfully!"
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
    fontSize: theme.fontSizes.display,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
  },
  courseContainer: {
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
  departmentName: {
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
