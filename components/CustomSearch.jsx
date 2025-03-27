import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import images from "../constants/images";
import theme from "../constants/theme";

const CustomSearch = ({ placeholder = "Search...", onSearch }) => {
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (onSearch) onSearch(searchText);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  const handleClear = () => {
    setSearchText("");
    if (onSearch) onSearch("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={searchText}
        onChangeText={setSearchText}
      />
      {searchText.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Image source={images.close} style={styles.icon} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingHorizontal: 10,
    height: 50,
  },
  input: {
    flex: 1,
    fontFamily: theme.fontFamily.Arial,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.primary,
  },
  clearButton: {
    padding: 6,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: theme.colors.primary,
  },
});

export default CustomSearch;
