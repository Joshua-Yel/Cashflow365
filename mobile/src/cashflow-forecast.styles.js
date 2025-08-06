import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  forecastSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  forecastScroll: {
    flexDirection: "row",
  },
  forecastCard: {
    width: 120,
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  forecastPeriod: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  forecastIncome: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 2,
  },
  forecastExpenses: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 8,
  },
  forecastBalance: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default styles;
