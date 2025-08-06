import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  predictionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  predictionHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  crystalBall: {
    fontSize: 40,
    marginBottom: 10,
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  confidenceText: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 5,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "#666",
  },
});

export default styles;
