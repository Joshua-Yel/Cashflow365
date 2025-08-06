import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import PropTypes from "prop-types";

const AIInsights = ({
  visible,
  fadeAnim,
  texts,
  predictedImpact,
  aiSuggestions,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.aiInsightsCard, { opacity: fadeAnim }]}>
      <Text style={styles.aiTitle}>🧠 {texts.aiInsights}</Text>

      {predictedImpact && (
        <View style={styles.impactSection}>
          <Text style={styles.sectionTitle}>{texts.predictedImpact}</Text>
          <View style={styles.impactStats}>
            <View style={styles.impactStat}>
              <Text style={styles.impactValue}>
                +₱{predictedImpact.balanceIncrease.toLocaleString()}
              </Text>
              <Text style={styles.impactLabel}>{texts.balanceIncrease}</Text>
            </View>
            <View style={styles.impactStat}>
              <Text style={styles.impactValue}>
                {predictedImpact.savingsBoost.toFixed(0)}%
              </Text>
              <Text style={styles.impactLabel}>{texts.savingsBoost}</Text>
            </View>
            <View style={styles.impactStat}>
              <Text style={styles.impactValue}>
                {predictedImpact.daysToNextGoal}
              </Text>
              <Text style={styles.impactLabel}>{texts.daysToNextGoal}</Text>
            </View>
          </View>
        </View>
      )}

      {aiSuggestions.length > 0 && (
        <View style={styles.suggestionsSection}>
          <Text style={styles.sectionTitle}>{texts.suggestions}</Text>
          {aiSuggestions.map((suggestion, index) => (
            <View
              key={index}
              style={[
                styles.suggestion,
                styles[`suggestion${suggestion.type}`],
              ]}
            >
              <Text style={styles.suggestionText}>{suggestion.text}</Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

AIInsights.propTypes = {
  visible: PropTypes.bool.isRequired,
  fadeAnim: PropTypes.object.isRequired,
  texts: PropTypes.object.isRequired,
  predictedImpact: PropTypes.object,
  aiSuggestions: PropTypes.array,
};

const styles = StyleSheet.create({
  aiInsightsCard: {
    backgroundColor: "#f8f9ff",
    borderWidth: 1,
    borderColor: "#e3e8ff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4c51bf",
    marginBottom: 15,
  },
  impactSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: 8,
  },
  impactStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  impactStat: {
    alignItems: "center",
  },
  impactValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
  },
  impactLabel: {
    fontSize: 12,
    color: "#718096",
    textAlign: "center",
  },
  suggestionsSection: {
    marginTop: 10,
  },
  suggestion: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestiontip: {
    backgroundColor: "#d4edda",
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  suggestioninsight: {
    backgroundColor: "#cce7ff",
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  suggestionText: {
    fontSize: 13,
    color: "#2d3748",
  },
});

export default AIInsights;
