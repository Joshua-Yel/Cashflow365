import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const BottomNav = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const handlePress = (screenName) => {
    navigation.navigate(screenName);
  };

  const TabItem = ({ screenName, icon, label, style }) => {
    const isActive = route.name === screenName;

    return (
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handlePress(screenName)}
        activeOpacity={0.6}
      >
        <Text style={[styles.icon, isActive && styles.activeIcon, style]}>
          {icon}
        </Text>
        <Text style={[styles.label, isActive && styles.activeLabel]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bottomNav}>
      <TabItem
        screenName="HomeScreen"
        icon="🏠"
        label="Home"
      />
      <TabItem
        screenName="PredictionScreen"
        icon="📊"
        label="Predict"
      />
      <TouchableOpacity
        style={styles.quickAddButton}
        onPress={() => handlePress("QuickAddScreen")}
        activeOpacity={0.8}
      >
        <Text style={styles.quickAddIcon}>+</Text>
      </TouchableOpacity>
      <TabItem
        screenName="ExpensesListScreen"
        icon="📝"
        label="History"
      />
      <TabItem
        screenName="SavingsGoalsScreen"
        icon="🎯"
        label="Goals"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  navItem: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 4,
  },
  icon: {
    fontSize: 22,
    marginBottom: 3,
    color: "#a0aec0", // gray-500
  },
  activeIcon: {
    color: "#4a5568", // gray-700
  },
  label: {
    fontSize: 10,
    color: "#718096", // gray-600
    fontWeight: "400",
  },
  activeLabel: {
    color: "#2d3748", // gray-800
    fontWeight: "600",
  },
  quickAddButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    bottom: 20, // Elevate the button
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  quickAddIcon: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
  },
});

export default BottomNav;
