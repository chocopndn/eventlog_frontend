import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import TabsComponent from "../../../components/TabsComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { fetchAdmins, deleteAdmin } from "../../../services/api";
import { router } from "expo-router";

import images from "../../../constants/images";
import SearchBar from "../../../components/CustomSearch";
import CustomModal from "../../../components/CustomModal";
import CustomButton from "../../../components/CustomButton";

import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";

export default function AdminsScreen() {
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const fetchedAdmins = await fetchAdmins();
        setAdmins(fetchedAdmins);
      } catch (err) {
        console.error("Error fetching admins:", err);
      }
    };

    loadAdmins();
  }, []);

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeletePress = (admin) => {
    setAdminToDelete(admin);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setAdminToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;

    try {
      await deleteAdmin(adminToDelete.id_number);

      setAdmins((prevAdmins) =>
        prevAdmins.filter(
          (admin) => admin.id_number !== adminToDelete.id_number
        )
      );

      handleModalClose();
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  return (
    <SafeAreaView style={globalStyles.secondaryContainer}>
      <Text style={styles.headerText}>ADMINS</Text>
      <View style={{ paddingHorizontal: theme.spacing.medium, width: "100%" }}>
        <SearchBar placeholder="Search admins..." onSearch={setSearchQuery} />
      </View>
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={styles.scrollview}
      >
        {filteredAdmins.length > 0 ? (
          filteredAdmins.map((admin) => (
            <TouchableOpacity
              key={admin.id_number}
              style={styles.adminContainer}
            >
              <View>
                <Text style={styles.name}>
                  {admin.first_name} {admin.last_name}
                </Text>
                <Text style={styles.idNumber}>{admin.id_number}</Text>
              </View>
              <View style={styles.iconContainer}>
                <TouchableOpacity>
                  <Image source={images.edit} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePress(admin)}>
                  <Image source={images.trash} style={styles.icon} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noResults}>No admins found</Text>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="ADD ADMIN"
          onPress={() => router.push("/admins/AddAdmin")}
        />
      </View>

      <CustomModal
        visible={isModalVisible}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${adminToDelete?.first_name} ${adminToDelete?.last_name}?`}
        type="warning"
        onClose={handleModalClose}
        onConfirm={handleConfirmDelete}
        cancelTitle="Cancel"
        confirmTitle="Delete"
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
  },
  adminContainer: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    flexDirection: "row",
    height: 50,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.small,
    marginBottom: theme.spacing.small,
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
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  name: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.large,
  },
  idNumber: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
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
    bottom: "15%",
    width: "80%",
    padding: theme.spacing.medium,
  },
});
