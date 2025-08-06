import React from "react";
import { View, Text } from "react-native";
import PropTypes from "prop-types";
import styles from "../../ai-recommendation-card.styles.js";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const priorityStyles = {
  high: { color: "#e74c3c", icon: "arrow-up-bold-circle" },
  medium: { color: "#f39c12", icon: "arrow-right-bold-circle" },
  low: { color: "#2ecc71", icon: "arrow-down-bold-circle" },
};

const RecommendationItem = ({ recommendation, texts }) => (
  <View style={styles.recommendationItem}>
    <MaterialCommunityIcons
      name={priorityStyles[recommendation.priority]?.icon || "information"}
      size={20}
      color={priorityStyles[recommendation.priority]?.color || "#34495e"}
      style={styles.priorityIcon}
    />
    <View style={styles.recommendationContent}>
      <Text style={styles.recommendationText}>{recommendation.text}</Text>
      {recommendation.impact > 0 && (
        <Text style={styles.recommendationImpact}>
          {texts.saveAmount}: ₱{recommendation.impact.toLocaleString()}
        </Text>
      )}
    </View>
  </View>
);

RecommendationItem.propTypes = {
  recommendation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    text: PropTypes.string.isRequired,
    impact: PropTypes.number.isRequired,
    priority: PropTypes.string.isRequired,
  }).isRequired,
  texts: PropTypes.object.isRequired,
};
const AiRecommendationCard = ({ recommendations, texts }) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.recommendationsCard}>
      <Text style={styles.recommendationsTitle}>
        💡 {texts.aiRecommendations}
      </Text>
      {recommendations.map((recommendation) => (
        <RecommendationItem
          key={recommendation.id}
          recommendation={recommendation}
          texts={texts}
        />
      ))}
    </View>
  );
};

AiRecommendationCard.propTypes = {
  recommendations: PropTypes.arrayOf(PropTypes.object).isRequired,
  texts: PropTypes.object.isRequired,
};

export default AiRecommendationCard;
