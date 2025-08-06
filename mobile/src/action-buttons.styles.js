import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: "#6c757d",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  planButton: {
    flex: 1,
    backgroundColor: "#27ae60",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  planButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default styles;
