import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import styles from "../../styles";

// Centralized translations for the component
const translations = {
  suggestedActions: {
    EN: "💡 Suggested Actions:",
    FIL: "💡 Mga Mungkahing Aksyon:",
  },
  showSolutions: {
    EN: "Show Solutions",
    FIL: "Ipakita ang Solusyon",
  },
  hideSolutions: {
    EN: "Hide Solutions",
    FIL: "Itago ang Solusyon",
  },
  predictionsTitle: {
    EN: "Smart Tips",
    FIL: "Smart Tips",
  },
};

/**
 * A single alert card component.
 * @param {{alert: object, language: string, onToggleAlert: function}} props
 */
const AlertCard = ({ alert, language, onToggleAlert }) => {
  const t = (key) => translations[key][language];

  const getBackgroundColor = () => {
    switch (alert.type) {
      case "critical":
        return "#e74c3c"; // Red for critical alerts
      case "warning":
        return "#f39c12"; // Orange for warnings
      case "info":
        return "#3498db"; // Blue for info
      default:
        return "#95a5a6"; // A fallback gray
    }
  };

  return (
    <View style={[styles.alertCard, { backgroundColor: getBackgroundColor() }]}>
      <Text style={styles.alertMessage}>{alert.message}</Text>
      {alert.seen && (
        <View style={styles.solutionContainer}>
          <Text style={styles.solutionTitle}>{t("suggestedActions")}</Text>
          <Text style={styles.solutionText}>{alert.solution}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.alertButton}
        onPress={() => onToggleAlert(alert.id)}
      >
        <Text style={styles.alertButtonText}>
          {alert.seen ? t("hideSolutions") : t("showSolutions")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

AlertCard.propTypes = {
  alert: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.oneOf(["critical", "warning", "info"]).isRequired,
    message: PropTypes.string.isRequired,
    solution: PropTypes.string.isRequired,
    seen: PropTypes.bool.isRequired,
  }).isRequired,
  language: PropTypes.oneOf(["EN", "FIL"]).isRequired,
  onToggleAlert: PropTypes.func.isRequired,
};

/**
 * Renders the AI Predictions section with a list of alerts.
 * This is a refactoring of the AI Predictions & Alerts section from HomeScreen.
 * @param {{alerts: Array<object>, language: string, onToggleAlert: function}} props
 */
const AIPredictionsSection = ({ alerts, language, onToggleAlert }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const t = (key) => translations[key][language];

  return (
    <View style={styles.alertsSection}>
      <Text style={styles.sectionTitle}>🤖 {t("predictionsTitle")}</Text>
      {alerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          language={language}
          onToggleAlert={onToggleAlert}
        />
      ))}
    </View>
  );
};

AIPredictionsSection.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.object).isRequired,
  language: PropTypes.oneOf(["EN", "FIL"]).isRequired,
  onToggleAlert: PropTypes.func.isRequired,
};

export default AIPredictionsSection;
