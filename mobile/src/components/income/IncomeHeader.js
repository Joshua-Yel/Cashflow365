import React from "react";
import { View, Text, StyleSheet } from "react-native";

const IncomeHeader = ({ language }) => {
  const currentTexts = {
    title: language === "EN" ? "Income Input" : "Pagpasok ng Kita",
  };

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{currentTexts.title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
});

export default IncomeHeader;
