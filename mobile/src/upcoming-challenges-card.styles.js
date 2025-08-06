import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  challengesCard: {
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
  challengesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  challengesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  issuesCounter: {
    backgroundColor: "#e74c3c",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  issuesText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "bold",
  },
  challengeItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  challengeIcon: {
    marginRight: 10,
  },
  challengeDetails: {
    flex: 1,
  },
  challengecritical: {
    backgroundColor: "rgba(231, 76, 60, 0.1)",
    borderLeftColor: "#e74c3c",
  },
  challengewarning: {
    backgroundColor: "rgba(243, 156, 18, 0.1)",
    borderLeftColor: "#f39c12",
  },
  challengeinfo: {
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    borderLeftColor: "#3498db",
  },
  challengeDate: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  challengeAmount: {
    fontSize: 12,
    color: "#7f8c8d",
  },
});

export default styles;
