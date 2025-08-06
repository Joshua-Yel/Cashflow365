import React from "react";
import { View, Text } from "react-native";
import PropTypes from "prop-types";
import styles from "../../financial-health-score.styles.js";

// Centralized translations for the component
const translations = {
  title: {
    EN: "Financial Health Score",
    FIL: "Financial Health Score",
  },
  status: {
    Excellent: { EN: "Healthy", FIL: "Maayos" },
    Good: { EN: "Warning", FIL: "Babala" },
    Poor: { EN: "Critical", FIL: "Mapanganib" },
  },
  timeframe: {
    EN: "Next 2 weeks",
    FIL: "Susunod na 2 linggo",
  },
  balance: {
    EN: "Current Balance:",
    FIL: "Kasalukuyang Balanse:",
  },
};

/**
 * Financial Health Score component that displays the user's financial health score
 * based on their financial data.
 * @param {{currentBalance: number, predictedShortfall: number, language: string}} props
 * @returns {JSX.Element}
 * */
const FinancialHealthScore = ({
  language,
  currentBalance,
  predictedShortfall,
}) => {
  const score = Math.round(
    Math.max(0, 100 - (predictedShortfall / currentBalance) * 100)
  );

  const getHealthScoreColor = () => {
    if (score >= 80) return "#27ae60"; // Green
    if (score >= 60) return "#f39c12"; // Yellow
    return "#e74c3c"; // Red
  };

  const getHealthScoreText = () => {
    if (score >= 80) return translations.status.Excellent[language];
    if (score >= 60) return translations.status.Good[language];
    return translations.status.Poor[language];
  };

  return (
    <View
      style={[
        styles.healthScoreCard,
        {
          backgroundColor: getHealthScoreColor(),
        },
      ]}
    >
      <View style={styles.healthScoreHeader}>
        <Text style={styles.healthScoreTitle}>
          {translations.title[language]}
        </Text>
        <Text style={styles.healthScoreValue}>{score}%</Text>
      </View>
      <Text style={styles.healthScoreStatus}>
        {getHealthScoreText()} • {translations.timeframe[language]}
      </Text>
      <Text style={styles.currentBalance}>
        {translations.balance[language]} ₱{currentBalance.toLocaleString()}
      </Text>
    </View>
  );
};

FinancialHealthScore.propTypes = {
  language: PropTypes.oneOf(["EN", "FIL"]).isRequired,
  currentBalance: PropTypes.number.isRequired,
  predictedShortfall: PropTypes.number.isRequired,
};

export default FinancialHealthScore;
