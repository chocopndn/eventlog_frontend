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
import TabsComponent from "../../../../components/TabsComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { fetchBlocks, deleteBlock } from "../../../../services/api";
import { router, useFocusEffect } from "expo-router";

import images from "../../../../constants/images";
import SearchBar from "../../../../components/CustomSearch";
import CustomModal from "../../../../components/CustomModal";
import CustomButton from "../../../../components/CustomButton";

import globalStyles from "../../../../constants/globalStyles";
import theme from "../../../../constants/theme";

export default function BlocksScreen() {
  const [blocks, setBlocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadBlocks = async () => {
    try {
      const fetchedBlocks = await fetchBlocks();
      setBlocks(Array.isArray(fetchedBlocks) ? fetchedBlocks : []);
    } catch (err) {
      console.error("Error fetching blocks:", err.message || err);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await loadBlocks();
    } catch (error) {
      console.error("Error refreshing data:", error.message || error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadBlocks();
    }, [])
  );

  const filteredBlocks = Array.isArray(blocks)
    ? blocks.filter((block) => {
        const name = block.name?.toLowerCase() || "";
        const courseName = block.course_name?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return name.includes(query) || courseName.includes(query);
      })
    : [];

  const handleDeletePress = (block) => {
    setBlockToDelete(block);
    setIsDeleteModalVisible(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalVisible(false);
    setBlockToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!blockToDelete) return;

    try {
      await deleteBlock(blockToDelete.value);
      setBlocks((prevBlocks) =>
        prevBlocks.map((block) =>
          block.value === blockToDelete.value
            ? { ...block, status: "deleted" }
            : block
        )
      );
      setIsDeleteModalVisible(false);
      setIsSuccessModalVisible(true);
    } catch (error) {
      console.error("Error deleting block:", error.message || error);
    }
  };

  return (
    <SafeAreaView style={[globalStyles.secondaryContainer, { paddingTop: 0 }]}>
      <Text style={styles.headerText}>BLOCKS</Text>
      <View style={{ paddingHorizontal: theme.spacing.medium, width: "100%" }}>
        <SearchBar
          placeholder="Search blocks..."
          onSearch={(query) => {
            setSearchQuery(query);
          }}
        />
      </View>
      <ScrollView
        style={{ flex: 1, width: "100%", marginBottom: 70 }}
        contentContainerStyle={[styles.scrollview, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshData} />
        }
      >
        {filteredBlocks.length > 0 ? (
          filteredBlocks.map((block) => (
            <TouchableOpacity
              key={block.value}
              style={styles.blockContainer}
              onPress={() => {
                router.push(`/blocks/BlockDetails?id=${block.value}`);
              }}
            >
              <View style={styles.textContainer}>
                <Text style={styles.name} numberOfLines={1}>
                  {block.label}
                </Text>
                <Text style={styles.courseName} numberOfLines={1}>
                  {block.status}
                </Text>
              </View>
              <View style={styles.iconContainer}>
                <TouchableOpacity
                  onPress={() => {
                    router.push(`/blocks/EditBlock?id=${block.value}`);
                  }}
                >
                  <Image source={images.edit} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeletePress(block)}
                  disabled={block.status === "deleted"}
                  style={{ opacity: block.status === "deleted" ? 0.5 : 1 }}
                >
                  <Image source={images.trash} style={styles.icon} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noResults}>No blocks found</Text>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="ADD BLOCK"
          onPress={() => {
            router.push("/blocks/AddBlock");
          }}
        />
      </View>

      <CustomModal
        visible={isDeleteModalVisible}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${blockToDelete?.label}?`}
        type="warning"
        onClose={handleDeleteModalClose}
        onConfirm={handleConfirmDelete}
        cancelTitle="Cancel"
        confirmTitle="Delete"
      />

      <CustomModal
        visible={isSuccessModalVisible}
        title="Success"
        message="Block deleted successfully!"
        type="success"
        onClose={() => {
          setIsSuccessModalVisible(false);
        }}
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
    fontSize: 60,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
  },
  blockContainer: {
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
  courseName: {
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
