import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import styles from "../../action-buttons.styles.js";

const ActionButtons = ({ onViewDetails, onCreatePlan, texts }) => {
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={onViewDetails}
      >
        <Text style={styles.detailsButtonText}>{texts.viewDetails}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.planButton}
        onPress={onCreatePlan}
      >
        <Text style={styles.planButtonText}>{texts.createPlan}</Text>
      </TouchableOpacity>
    </View>
  );
};

ActionButtons.propTypes = {
  onViewDetails: PropTypes.func.isRequired,
  onCreatePlan: PropTypes.func.isRequired,
  texts: PropTypes.shape({
    viewDetails: PropTypes.string.isRequired,
    createPlan: PropTypes.string.isRequired,
  }).isRequired,
};

export default ActionButtons;
