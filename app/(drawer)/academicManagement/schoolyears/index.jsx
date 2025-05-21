import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import {
  uploadSchoolYearFile,
  changeSchoolYear,
} from "../../../../services/api";
import CustomButton from "../../../../components/CustomButton";
import globalStyles from "../../../../constants/globalStyles";
import CustomModal from "../../../../components/CustomModal";
import theme from "../../../../constants/theme";

const pickDocument = async (
  type,
  setUploading,
  setMessage,
  setSuccessModalVisible
) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({ type: "text/csv" });
    console.log("Document Picker Result:", result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedFile = result.assets[0];
      setUploading(true);
      setMessage("Uploading file...");

      try {
        let response;
        if (type === "changeSchoolYear") {
          response = await changeSchoolYear(selectedFile.uri);
          setMessage("School year changed successfully!");
        } else {
          response = await uploadSchoolYearFile(selectedFile.uri, type);
          setMessage("Upload successful!");
        }

        console.log("Response:", response);
        setSuccessModalVisible(true);
      } catch (error) {
        console.error("Error uploading file:", error);
        setMessage("Error uploading file.");
      }
    } else {
      console.log("File picking cancelled.");
      setMessage("File picking cancelled.");
    }
  } catch (error) {
    console.error("Document pick error:", error);
    setMessage("Error picking file.");
  } finally {
    setUploading(false);
  }
};

export default function SchoolYearScreen() {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleChangeSchoolYear = () => {
    setModalType("changeSchoolYear");
    setModalVisible(true);
  };

  const handleUpdateStudentList = () => {
    setModalType("updateStudentList");
    pickDocument(
      "updateStudentList",
      setUploading,
      setMessage,
      setSuccessModalVisible
    );
  };

  const handleModalConfirm = () => {
    setModalVisible(false);
    if (modalType === "changeSchoolYear") {
      setTimeout(() => {
        pickDocument(
          "changeSchoolYear",
          setUploading,
          setMessage,
          setSuccessModalVisible
        );
      }, 300);
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModalVisible(false);
  };

  return (
    <View style={globalStyles.secondaryContainer}>
      <View style={styles.buttonWrapper}>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Change School Year"
            onPress={handleChangeSchoolYear}
          />
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Update Student List"
            onPress={handleUpdateStudentList}
          />
        </View>
      </View>

      <CustomModal
        visible={modalVisible}
        onConfirm={handleModalConfirm}
        onCancel={() => setModalVisible(false)}
        title={
          modalType === "changeSchoolYear"
            ? "Change School Year"
            : "Update Student List"
        }
        message={
          modalType === "changeSchoolYear"
            ? "Are you sure you want to change the school year and create new blocks based on the uploaded CSV file?"
            : "Are you sure you want to update the student list based on the uploaded CSV file?"
        }
        confirmTitle="Confirm"
      />

      <CustomModal
        visible={successModalVisible}
        onClose={handleSuccessModalClose}
        title="Success"
        message={
          modalType === "changeSchoolYear"
            ? "The school year has been changed successfully."
            : "The CSV file has been uploaded successfully."
        }
        type="success"
        cancelTitle="CLOSE"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    width: "100%",
    paddingHorizontal: theme.spacing.medium,
  },
  buttonContainer: {
    paddingBottom: theme.spacing.medium,
  },
});
