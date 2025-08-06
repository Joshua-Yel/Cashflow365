import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import PropTypes from "prop-types";

const RecurringSection = ({
  texts,
  isRecurring,
  onSetIsRecurring,
  recurringFrequency,
  onSetRecurringFrequency,
}) => {
  return (
    <View style={styles.inputGroup}>
      <View style={styles.recurringContainer}>
        <Text style={styles.inputLabel}>{texts.recurring}</Text>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isRecurring && styles.toggleButtonActive,
          ]}
          onPress={() => onSetIsRecurring(!isRecurring)}
        >
          <Text
            style={[styles.toggleText, isRecurring && styles.toggleTextActive]}
          >
            {isRecurring ? "✓" : "○"}
          </Text>
        </TouchableOpacity>
      </View>

      {isRecurring && (
        <View style={styles.frequencyContainer}>
          <Text style={styles.inputLabel}>{texts.frequency}</Text>
          <View style={styles.frequencyOptions}>
            {Object.entries(texts.frequencies).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.frequencyOption,
                  recurringFrequency === key && styles.selectedFrequency,
                ]}
                onPress={() => onSetRecurringFrequency(key)}
              >
                <Text style={styles.frequencyText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

RecurringSection.propTypes = {
  texts: PropTypes.object.isRequired,
  isRecurring: PropTypes.bool.isRequired,
  onSetIsRecurring: PropTypes.func.isRequired,
  recurringFrequency: PropTypes.string.isRequired,
  onSetRecurringFrequency: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  recurringContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  toggleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#27ae60",
    borderColor: "#27ae60",
  },
  toggleText: {
    fontSize: 16,
    color: "#ddd",
  },
  toggleTextActive: {
    color: "#fff",
  },
  frequencyContainer: {
    marginTop: 10,
  },
  frequencyOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  frequencyOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    backgroundColor: "#fafafa",
  },
  selectedFrequency: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  frequencyText: {
    fontSize: 12,
    color: "#333",
  },
});

export default RecurringSection;
