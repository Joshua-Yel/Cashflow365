import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  riskCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  riskPercentage: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
});

export default styles;
