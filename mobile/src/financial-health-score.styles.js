import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  healthScoreCard: {
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  healthScoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  healthScoreTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  healthScoreValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  healthScoreStatus: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 5,
  },
  currentBalance: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default styles;
