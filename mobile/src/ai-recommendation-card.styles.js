import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  recommendationsCard: {
    backgroundColor: "#d4edda",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#155724",
    marginBottom: 15,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  priorityIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationText: {
    fontSize: 14,
    color: "#155724",
    marginBottom: 4,
  },
  recommendationImpact: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "bold",
  },
});

export default styles;
