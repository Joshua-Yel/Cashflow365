import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import PropTypes from "prop-types";

const AmountInput = ({ label, amount, onSetAmount }) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.inputField}
        placeholder="₱10,000"
        keyboardType="numeric"
        value={amount}
        onChangeText={onSetAmount}
        placeholderTextColor="#888"
      />
    </View>
  );
};

AmountInput.propTypes = {
  label: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired,
  onSetAmount: PropTypes.func.isRequired,
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
  inputField: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingLeft: 15,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fafafa",
  },
});

export default AmountInput;
