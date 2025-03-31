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
import { fetchAdmins, disableAdmin } from "../../../services/api";
import { router, useFocusEffect } from "expo-router";
import images from "../../../constants/images";
import SearchBar from "../../../components/CustomSearch";
import CustomModal from "../../../components/CustomModal";
import CustomButton from "../../../components/CustomButton";
import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";

export default function AdminsScreen() {
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDisableModalVisible, setIsDisableModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [adminToDisable, setAdminToDisable] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAdmins = async () => {
    try {
      const fetchedAdmins = await fetchAdmins();
      setAdmins(fetchedAdmins);
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadAdmins();
    }, [])
  );

  const refreshData = async () => {
    setRefreshing(true);
    await loadAdmins();
    setRefreshing(false);
  };

  const lowerCaseQuery = searchQuery.toLowerCase();
  const filteredAdmins = admins.filter(
    (admin) =>
      admin.first_name.toLowerCase().includes(lowerCaseQuery) ||
      admin.last_name.toLowerCase().includes(lowerCaseQuery)
  );

  const handleDisablePress = (admin) => {
    setAdminToDisable(admin);
    setIsDisableModalVisible(true);
  };

  const handleDisableModalClose = () => {
    setIsDisableModalVisible(false);
    setAdminToDisable(null);
  };

  const handleConfirmDisable = async () => {
    if (!adminToDisable) return;

    try {
      await disableAdmin(adminToDisable.id_number);
      await loadAdmins();
      setIsDisableModalVisible(false);
      setTimeout(() => setIsSuccessModalVisible(true), 300);
    } catch (error) {
      console.error("Error disabling admin:", error);
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        {filteredAdmins.length > 0 ? (
          filteredAdmins.map((admin) => (
            <TouchableOpacity
              key={admin.id_number}
              style={styles.adminContainer}
              onPress={() =>
                router.push(`/admins/AdminDetails?id_number=${admin.id_number}`)
              }
            >
              <View>
                <Text style={styles.name}>
                  {admin.first_name} {admin.last_name}
                </Text>
                <Text style={styles.status}>{admin.status}</Text>
              </View>
              <View style={styles.iconContainer}>
                <TouchableOpacity
                  onPress={() =>
                    router.push(
                      `/admins/EditAdmin?id_number=${admin.id_number}`
                    )
                  }
                >
                  <Image source={images.edit} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDisablePress(admin)}
                  disabled={admin.status === "disabled"}
                  style={{ opacity: admin.status === "disabled" ? 0.5 : 1 }}
                >
                  <Image source={images.disabled} style={styles.icon} />
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
        visible={isDisableModalVisible}
        title="Confirm Disable"
        message={`Are you sure you want to disable ${adminToDisable?.first_name} ${adminToDisable?.last_name}?`}
        type="warning"
        onClose={handleDisableModalClose}
        onConfirm={handleConfirmDisable}
        cancelTitle="Cancel"
        confirmTitle="Disable"
      />
      <CustomModal
        visible={isSuccessModalVisible}
        title="Success"
        message="Admin disabled successfully!"
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
  status: {
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
