import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import styles from "../../ai-smart-tip-card.styles.js";

// Centralized translations
const translations = {
  title: {
    EN: "AI Smart Tip",
    FIL: "AI Smart Tip",
  },
};

const AiSmartTipCard = ({ tip, language, totalTips, currentTipIndex }) => {
  if (!tip) {
    return null;
  }

  const t = (key) => translations[key][language];

  return (
    <View style={styles.aiTipCard}>
      <View style={styles.aiTipHeader}>
        <Text style={styles.aiTipIcon}>🤖</Text>
        <Text style={styles.aiTipTitle}>{t("title")}</Text>
      </View>
      <Text style={styles.aiTipText}>{tip}</Text>
      <View style={styles.tipIndicators}>
        {Array.from({ length: totalTips }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.tipIndicator,
              {
                backgroundColor:
                  index === currentTipIndex
                    ? "#fff"
                    : "rgba(255, 255, 255, 0.5)",
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

AiSmartTipCard.propTypes = {
  tip: PropTypes.string,
  language: PropTypes.oneOf(["EN", "FIL"]).isRequired,
  totalTips: PropTypes.number.isRequired,
  currentTipIndex: PropTypes.number.isRequired,
};

export default AiSmartTipCard;
