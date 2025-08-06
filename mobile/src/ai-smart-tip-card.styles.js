import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  aiTipCard: {
    backgroundColor: "#3498db",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  aiTipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  aiTipIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  aiTipTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  aiTipText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
    minHeight: 60, // To prevent layout shifts as tips change
  },
  tipIndicators: {
    flexDirection: "row",
    justifyContent: "center",
  },
  tipIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default styles;
