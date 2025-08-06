import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import PropTypes from "prop-types";

const CategorySelector = ({
  label,
  categories,
  selectedCategory,
  onSetCategory,
}) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.categoryContainer}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.categoryOption,
              selectedCategory === item.id && styles.selectedCategory,
            ]}
            onPress={() => onSetCategory(item.id)}
          >
            <Text style={styles.categoryText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

CategorySelector.propTypes = {
  label: PropTypes.string.isRequired,
  categories: PropTypes.array.isRequired,
  selectedCategory: PropTypes.string.isRequired,
  onSetCategory: PropTypes.func.isRequired,
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
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryOption: {
    flexGrow: 1,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
    minWidth: "48%",
  },
  selectedCategory: {
    backgroundColor: "#27ae60",
    borderColor: "#27ae60",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
  },
});

export default CategorySelector;
