import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";

const OnboardingScreen = ({ navigation }) => {
  const [pageIndex, setPageIndex] = useState(0);

  const pages = [
    {
      title: "Maligayang Pagdating! / Welcome!",
      subtitle: "Makita ang Hinaharap",
      description:
        "Malaman ang inyong financial situation 2-4 weeks bago pa ito mangyari.",
      icon: "🔮",
    },
    {
      title: "Automated Financial Predictions",
      subtitle: "Anticipate Financial Stress",
      description:
        "Get alerts 2-4 weeks ahead, predicting upcoming expenses like school fees or medical bills.",
      icon: "📊",
    },
    {
      title: "Smart Budget Adjustments",
      subtitle: "Stay on Track",
      description:
        "AI-generated nudges will guide you, like 'Delay this purchase' to keep your budget in check.",
      icon: "💡",
    },
    {
      title: "Tailored Financial Plans",
      subtitle: "Personalized Financial Guidance",
      description:
        "Learn responsible financial planning with our modules designed specifically for low-income families.",
      icon: "📅",
    },
  ];

  const handleNext = () => {
    if (pageIndex < pages.length - 1) {
      setPageIndex(pageIndex + 1);
    } else {
      navigation.navigate("SetupProfileScreen");
    }
  };

  const handleLanguageToggle = () => {
    // Toggle language functionality (we'll assume user selection for now)
    alert("Language toggle clicked!");
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar barStyle="light-content" />

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Page content */}
        <View style={styles.mainSection}>
          <Text style={styles.icon}>{pages[pageIndex].icon}</Text>
          <Text style={styles.title}>{pages[pageIndex].title}</Text>
          <Text style={styles.subtitle}>{pages[pageIndex].subtitle}</Text>
          <Text style={styles.description}>{pages[pageIndex].description}</Text>
        </View>

        {/* Language Toggle Button */}
        <TouchableOpacity
          style={styles.languageToggle}
          onPress={handleLanguageToggle}
        >
          <Text style={styles.languageText}>EN/FIL</Text>
        </TouchableOpacity>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Next Button */}
          <TouchableOpacity
            style={styles.btn}
            onPress={handleNext}
          >
            <Text style={styles.btnText}>
              {pageIndex === pages.length - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>

          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {pages.map((_, index) => (
              <View
                key={index}
                style={
                  index === pageIndex ? styles.dotActive : styles.dotInactive
                }
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  statusBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statusText: {
    color: "#777",
    fontSize: 12,
  },
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
    paddingTop: 40,
  },
  mainSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  icon: {
    fontSize: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  languageToggle: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 20,
  },
  languageText: {
    fontSize: 14,
    color: "#333",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  btn: {
    backgroundColor: "#4c63afff",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 20,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  pagination: {
    flexDirection: "row",
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4CAF50",
    margin: 5,
  },
  dotInactive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
    margin: 5,
  },
});

export default OnboardingScreen;
