import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  alertsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  alertCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertMessage: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },
  solutionContainer: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  solutionTitle: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  solutionText: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 18,
  },
  alertButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  alertButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default styles;
