import React from "react";
import { View, Text } from "react-native";
import PropTypes from "prop-types";
import styles from "../../upcoming-challenges-card.styles.js";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const challengeIcons = {
  critical: { name: "alert-octagon", color: "#c0392b" },
  warning: { name: "alert-circle-outline", color: "#f39c12" },
  info: { name: "information-outline", color: "#2980b9" },
};

const ChallengeItem = ({ challenge, texts }) => (
  <View
    style={[
      styles.challengeItem,
      styles[`challenge${challenge.type}`], // e.g., styles.challengecritical
    ]}
  >
    <MaterialCommunityIcons
      name={challengeIcons[challenge.type]?.name || "information-outline"}
      size={24}
      color={challengeIcons[challenge.type]?.color || "#2980b9"}
      style={styles.challengeIcon}
    />
    <View style={styles.challengeDetails}>
      <Text style={styles.challengeDate}>
        {challenge.date} - {challenge.title}
      </Text>
      <Text style={styles.challengeAmount}>
        {texts.estimate}: ₱{challenge.estimate.toLocaleString()}
        {challenge.note && ` (${challenge.note})`}
      </Text>
    </View>
  </View>
);

ChallengeItem.propTypes = {
  challenge: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["critical", "warning", "info"]),
    estimate: PropTypes.number,
    note: PropTypes.string,
  }).isRequired,
  texts: PropTypes.object.isRequired,
};

const UpcomingChallengesCard = ({ challenges, texts }) => {
  if (!challenges || challenges.length === 0) {
    return null;
  }

  return (
    <View style={styles.challengesCard}>
      <View style={styles.challengesHeader}>
        <Text style={styles.challengesTitle}>{texts.upcomingChallenges}</Text>
        <View style={styles.issuesCounter}>
          <Text style={styles.issuesText}>
            {challenges.length} {texts.issues}
          </Text>
        </View>
      </View>

      {challenges.map((challenge) => (
        <ChallengeItem
          key={challenge.id}
          challenge={challenge}
          texts={texts}
        />
      ))}
    </View>
  );
};

UpcomingChallengesCard.defaultProps = {
  challenges: [],
};

UpcomingChallengesCard.propTypes = {
  challenges: PropTypes.arrayOf(PropTypes.object).isRequired,
  texts: PropTypes.object.isRequired,
};

export default UpcomingChallengesCard;
