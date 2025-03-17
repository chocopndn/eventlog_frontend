import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import { useFonts } from "expo-font";
import images from "../constants/images";

const CustomMultiSelect = ({
  data = [],
  placeholder = "Select departments",
  onChange,
}) => {
  const [selected, setSelected] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loaded] = useFonts({
    Arial: require("../assets/fonts/Arial.ttf"),
  });

  if (!loaded) {
    return null;
  }

  const toggleSelection = (item) => {
    if (selected.includes(item.value)) {
      setSelected(selected.filter((val) => val !== item.value));
    } else {
      setSelected([...selected, item.value]);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        selected.includes(item.value) && styles.selectedItem,
      ]}
      onPress={() => toggleSelection(item)}
    >
      <Text
        style={[
          styles.text,
          selected.includes(item.value) && styles.selectedText,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.triggerText}>
          {selected.length > 0
            ? `${selected.length} departments selected`
            : placeholder}
        </Text>
        <Image source={images.arrowDown} style={{ width: 24, height: 24 }} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item.value}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.text}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CustomMultiSelect;

const styles = StyleSheet.create({
  container: { padding: 8 },
  trigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    borderWidth: 2,
    borderColor: "#255586",
  },
  triggerText: {
    fontFamily: "Arial",
    color: "#255586",
  },
  item: {
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedItem: {
    backgroundColor: "#255586",
  },
  selectedText: {
    color: "#FBF1E5",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FBF1E5",
    padding: 10,
    borderWidth: 4,
    width: "80%",
    borderColor: "#255586",
  },
  closeButton: {
    marginTop: 10,
    alignSelf: "flex-end",
  },
  text: {
    fontFamily: "Arial",
    color: "#255586",
  },
});
