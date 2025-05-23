import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useFonts } from "expo-font";

import theme from "../../constants/theme";
import globalStyles from "../../constants/globalStyles";
import WebHeader from "../../components/WebHeader";
import CustomSearch from "../../components/CustomSearch";
import images from "../../constants/images";
import { router } from "expo-router";

import ArialFont from "../../assets/fonts/Arial.ttf";
import ArialBoldFont from "../../assets/fonts/ArialBold.ttf";
import ArialItalicFont from "../../assets/fonts/ArialItalic.ttf";
import SquadaOneFont from "../../assets/fonts/SquadaOne.ttf";

const Web = () => {
  const [fontsLoaded, fontError] = useFonts({
    Arial: require("../../assets/fonts/Arial.ttf"),
    ArialBold: require("../../assets/fonts/ArialBold.ttf"),
    ArialItalic: require("../../assets/fonts/ArialItalic.ttf"),
    SquadaOne: require("../../assets/fonts/SquadaOne.ttf"),
  });

  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    if (Platform.OS === "web") {
      console.log("Web component: Registering fonts for web...");

      const style = document.createElement("style");
      style.textContent = `
        @font-face {
          font-family: 'Arial';
          src: url('${ArialFont}') format('truetype');
          font-display: swap;
        }
        @font-face {
          font-family: 'ArialBold';
          src: url('${ArialBoldFont}') format('truetype');
          font-display: swap;
          font-weight: bold;
        }
        @font-face {
          font-family: 'ArialItalic';
          src: url('${ArialItalicFont}') format('truetype');
          font-display: swap;
          font-style: italic;
        }
        @font-face {
          font-family: 'SquadaOne';
          src: url('${SquadaOneFont}') format('truetype');
          font-display: swap;
        }
      `;

      const existingStyle = document.getElementById("web-custom-fonts");
      if (!existingStyle) {
        style.id = "web-custom-fonts";
        document.head.appendChild(style);
        console.log("Web component: Font CSS added to document");
      }

      if (document.fonts) {
        Promise.all([
          document.fonts.load("16px Arial"),
          document.fonts.load("16px ArialBold"),
          document.fonts.load("16px ArialItalic"),
          document.fonts.load("16px SquadaOne"),
        ])
          .then(() => {
            console.log("Web component: All fonts loaded successfully");
            setFontsReady(true);
          })
          .catch((error) => {
            console.warn("Web component: Font loading failed:", error);
            setFontsReady(true);
          });
      } else {
        setTimeout(() => {
          console.log("Web component: Using fallback font loading method");
          setFontsReady(true);
        }, 500);
      }
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" && fontsLoaded && !fontError) {
      setFontsReady(true);
    }
  }, [fontsLoaded, fontError]);

  if (!fontsReady) {
    return (
      <View
        style={[
          globalStyles.secondaryContainer,
          { padding: 0, justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text
          style={{
            fontFamily:
              Platform.OS === "web" ? "system-ui, sans-serif" : "system",
            fontSize: 18,
            color: theme.colors.primary,
            marginBottom: 10,
          }}
        >
          Loading...
        </Text>
        {Platform.OS === "web" && (
          <Text
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 14,
              color: "#666",
              textAlign: "center",
            }}
          >
            Preparing fonts for web interface
          </Text>
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        globalStyles.secondaryContainer,
        { padding: 0, justifyContent: "flex-start" },
      ]}
    >
      <WebHeader title="ATTENDANCE RECORD" />
      <View style={styles.searchContainer}>
        <CustomSearch />
      </View>

      <ScrollView
        style={{ width: "90%" }}
        contentContainerStyle={styles.scrollView}
      >
        <Text style={[styles.title, { marginTop: theme.spacing.large }]}>
          ONGOING EVENTS
        </Text>
        <View style={styles.eventWrapper}>
          <TouchableOpacity
            style={styles.eventContainer}
            onPress={() => {
              router.push("web/Records");
            }}
          >
            <Image source={images.calendar} style={styles.icon} />
            <Text style={styles.dateTitle}>
              January 15, 2025 - Microsoft Office Seminar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.eventContainer, { marginLeft: 10 }]}
            onPress={() => {
              router.push("web/Records");
            }}
          >
            <Image source={images.calendar} style={styles.icon} />
            <Text style={styles.dateTitle}>
              January 15, 2025 - Microsoft Office Seminar
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { marginTop: theme.spacing.xlarge }]}>
          PAST EVENTS
        </Text>
        <View style={styles.eventWrapper}>
          <TouchableOpacity
            style={styles.eventContainer}
            onPress={() => {
              router.push("web/Records");
            }}
          >
            <Image source={images.calendar} style={styles.icon} />
            <Text style={styles.dateTitle}>
              January 15, 2025 - Microsoft Office Seminar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.eventContainer, { marginLeft: 10 }]}
            onPress={() => {
              router.push("web/Records");
            }}
          >
            <Image source={images.calendar} style={styles.icon} />
            <Text style={styles.dateTitle}>
              January 15, 2025 - Microsoft Office Seminar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default Web;

const styles = StyleSheet.create({
  searchContainer: {
    width: "90%",
    paddingTop: 40,
  },
  title: {
    fontSize: theme.fontSizes.display,
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
  },
  eventContainer: {
    borderWidth: 2,
    width: "55%",
    height: 50,
    borderColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.medium,
  },
  icon: {
    height: 32,
    width: 32,
    tintColor: theme.colors.primary,
  },
  eventWrapper: {
    width: "90%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  scrollView: {
    alignItems: "center",
    width: "100%",
  },
  dateTitle: {
    fontFamily: theme.fontFamily.SquadaOne,
    color: theme.colors.primary,
    paddingLeft: theme.spacing.medium,
    fontSize: theme.fontSizes.large,
  },
});
