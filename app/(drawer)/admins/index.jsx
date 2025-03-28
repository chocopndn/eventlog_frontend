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
import { fetchAdmins } from "../../../services/api";

import images from "../../../constants/images";
import SearchBar from "../../../components/CustomSearch";

import globalStyles from "../../../constants/globalStyles";
import theme from "../../../constants/theme";

export default function AdminsScreen() {
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <SafeAreaView style={globalStyles.secondaryContainer}>
      <Text style={styles.headerText}>ADMINS</Text>
      <View style={{ paddingHorizontal: theme.spacing.medium, width: "100%" }}>
        <SearchBar placeholder="Search admins..." onSearch={setSearchQuery} />
      </View>
      <ScrollView
        style={{ width: "100%" }}
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
                <TouchableOpacity>
                  <Image source={images.trash} style={styles.icon} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noResults}>No admins found</Text>
        )}
      </ScrollView>

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
});
