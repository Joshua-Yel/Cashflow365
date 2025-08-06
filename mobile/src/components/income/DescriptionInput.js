import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import PropTypes from "prop-types";

const DescriptionInput = ({
  label,
  description,
  onSetDescription,
  placeholder,
}) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={styles.inputField}
        placeholder={placeholder}
        value={description}
        onChangeText={onSetDescription}
        placeholderTextColor="#888"
      />
    </View>
  );
};
DescriptionInput.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onSetDescription: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
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

export default DescriptionInput;
