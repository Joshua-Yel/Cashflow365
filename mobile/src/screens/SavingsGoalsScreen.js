import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../firebaseConfig";
import { ref, onValue, push, remove, update } from "firebase/database";
import useSavingsAI from "../hooks/useSavingsAI";

const SavingsGoalsScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [rawGoals, setRawGoals] = useState([]);
  const [language, setLanguage] = useState("EN");
  const [modalVisible, setModalVisible] = useState(false);
  const [contributionModalVisible, setContributionModalVisible] =
    useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState("");

  // Form state for new goal
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState(""); // YYYY-MM-DD

  const texts = {
    EN: {
      title: "Savings Goals",
      noGoals:
        "You have no savings goals yet. Tap the button below to add one!",
      addGoal: "Add New Goal",
      goalName: "Goal Name (e.g., New Phone)",
      targetAmount: "Target Amount (₱)",
      targetDate: "Target Date (YYYY-MM-DD)",
      saveGoal: "Save Goal",
      cancel: "Cancel",
      aiInsights: "AI-Powered Insights",
      saved: "Saved",
      target: "Target",
      projection: "AI Projection",
      achievable: "On Track",
      atRisk: "At Risk",
      deleteGoal: "Delete Goal",
      deleteConfirm: "Are you sure you want to delete this goal?",
      contribute: "Contribute",
      contributeTo: "Contribute to Goal",
      contributionAmount: "Contribution Amount (₱)",
    },
    FIL: {
      title: "Mga Layunin sa Pag-iipon",
      noGoals:
        "Wala ka pang mga layunin sa pag-iipon. Pindutin ang button sa ibaba para magdagdag!",
      addGoal: "Magdagdag ng Bagong Layunin",
      goalName: "Pangalan ng Layunin (hal., Bagong Telepono)",
      targetAmount: "Target na Halaga (₱)",
      targetDate: "Target na Petsa (YYYY-MM-DD)",
      saveGoal: "I-save ang Layunin",
      cancel: "Kanselahin",
      aiInsights: "Mga Insight mula sa AI",
      saved: "Naipon",
      target: "Target",
      projection: "Hula ng AI",
      achievable: "Nasa Tamang Daan",
      atRisk: "Nanganganib",
      deleteGoal: "Burahin ang Layunin",
      deleteConfirm: "Sigurado ka bang gusto mong burahin ang layuning ito?",
      contribute: "Mag-ambag",
      contributeTo: "Mag-ambag sa Layunin",
      contributionAmount: "Halaga ng Ambag (₱)",
    },
  };

  const currentTexts = texts[language];

  // --- Fetch raw data from Firebase ---
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const profileRef = ref(db, `users/${user.uid}/profile`);
    const expensesRef = ref(db, `users/${user.uid}/expenses`);
    const goalsRef = ref(db, `users/${user.uid}/savingsGoals`);

    const unsubProfile = onValue(profileRef, (snapshot) => {
      const data = snapshot.val();
      setProfile(data);
      if (data?.language) setLanguage(data.language);
    });

    const unsubExpenses = onValue(expensesRef, (snapshot) => {
      setExpenses(Object.values(snapshot.val() || {}));
    });

    const unsubGoals = onValue(goalsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const goalsList = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));
      setRawGoals(goalsList);
    });

    return () => {
      unsubProfile();
      unsubExpenses();
      unsubGoals();
    };
  }, []);

  // --- AI-Powered Savings Analysis Hook ---
  const {
    isLoading,
    insights: aiInsights,
    processedGoals: goals,
  } = useSavingsAI(rawGoals, profile, expenses, language);

  const loading = isLoading && goals.length === 0;

  const handleAddGoal = async () => {
    if (!goalName || !targetAmount || !targetDate) {
      Alert.alert("Missing Fields", "Please fill out all fields for the goal.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      Alert.alert("Invalid Date", "Please use YYYY-MM-DD format for the date.");
      return;
    }

    const user = auth.currentUser;
    const newGoal = {
      name: goalName,
      targetAmount: parseFloat(targetAmount),
      savedAmount: 0, // Starts at 0
      targetDate,
      createdAt: new Date().toISOString(),
    };

    try {
      const goalsRef = ref(db, `users/${user.uid}/savingsGoals`);
      await push(goalsRef, newGoal);
      Alert.alert("Success", "New savings goal added!");
      setModalVisible(false);
      setGoalName("");
      setTargetAmount("");
      setTargetDate("");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not save the new goal.");
    }
  };

  const handleOpenContributionModal = (goal) => {
    setSelectedGoal(goal);
    setContributionAmount("");
    setContributionModalVisible(true);
  };

  const handleContributeToGoal = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount to contribute."
      );
      return;
    }

    const user = auth.currentUser;
    if (!user || !selectedGoal) return;

    const newSavedAmount =
      (selectedGoal.savedAmount || 0) + parseFloat(contributionAmount);

    try {
      const goalRef = ref(
        db,
        `users/${user.uid}/savingsGoals/${selectedGoal.id}`
      );
      await update(goalRef, { savedAmount: newSavedAmount });
      Alert.alert(
        "Success!",
        `You contributed ₱${contributionAmount} to your '${selectedGoal.name}' goal.`
      );
      setContributionModalVisible(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not update your savings goal.");
    }
  };

  const handleSuggestionPress = (suggestion) => {
    const goalToContribute = goals.find((g) => g.id === suggestion.goalId);
    if (goalToContribute) {
      // Open the contribution modal for the suggested goal
      handleOpenContributionModal(goalToContribute);
      // Pre-fill the contribution amount from the AI suggestion
      setContributionAmount(suggestion.suggestedAmount.toString());
    } else {
      Alert.alert("Error", "Could not find the suggested goal.");
    }
  };
  const handleDeleteGoal = (goalId) => {
    Alert.alert(currentTexts.deleteGoal, currentTexts.deleteConfirm, [
      { text: currentTexts.cancel, style: "cancel" },
      {
        text: currentTexts.deleteGoal,
        style: "destructive",
        onPress: async () => {
          const user = auth.currentUser;
          const goalRef = ref(db, `users/${user.uid}/savingsGoals/${goalId}`);
          await remove(goalRef);
          Alert.alert("Deleted", "The savings goal has been removed.");
        },
      },
    ]);
  };

  const ProgressBar = ({ percentage, color }) => (
    <View style={styles.progressBarContainer}>
      <View
        style={[
          styles.progressBar,
          { width: `${Math.min(percentage, 100)}%`, backgroundColor: color },
        ]}
      />
    </View>
  );

  // The hook manages loading state, this shows a spinner on initial load.
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          size="large"
          color="#667eea"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentTexts.title}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* AI Insights Card */}
        {aiInsights.length > 0 && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>{currentTexts.aiInsights}</Text>
            {aiInsights.map((tip, index) => {
              if (tip.type === "suggestion") {
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.tipItem, styles.suggestionTipItem]}
                    onPress={() => handleSuggestionPress(tip)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.tipIcon}>{tip.icon}</Text>
                    <Text style={styles.tipText}>{tip.text}</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <View
                  key={index}
                  style={styles.tipItem}
                >
                  <Text style={styles.tipIcon}>{tip.icon}</Text>
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.noGoalsText}>{currentTexts.noGoals}</Text>
          </View>
        ) : (
          goals.map((goal) => {
            const percentage = (goal.savedAmount / goal.targetAmount) * 100;
            return (
              <TouchableOpacity
                key={goal.id}
                style={styles.goalCard}
                onPress={() => handleOpenContributionModal(goal)}
                onLongPress={() => handleDeleteGoal(goal.id)}
              >
                <View style={styles.goalHeader}>
                  <Text style={styles.goalName}>{goal.name}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: goal.isAchievable
                          ? "#4ecdc4"
                          : "#ff6b6b",
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {goal.isAchievable
                        ? currentTexts.achievable
                        : currentTexts.atRisk}
                    </Text>
                  </View>
                </View>
                <ProgressBar
                  percentage={percentage}
                  color={goal.isAchievable ? "#4ecdc4" : "#ff6b6b"}
                />
                <View style={styles.amountRow}>
                  <Text style={styles.amountText}>
                    {currentTexts.saved}: ₱
                    {(goal.savedAmount || 0).toLocaleString()}
                  </Text>
                  <Text style={styles.amountText}>
                    {currentTexts.target}: ₱{goal.targetAmount.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.projectionRow}>
                  <Text style={styles.projectionText}>
                    {currentTexts.projection}: {goal.projection}
                  </Text>
                  <Text style={styles.projectionText}>
                    Target: {goal.targetDate}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>{currentTexts.addGoal}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentTexts.addGoal}</Text>
            <TextInput
              style={styles.input}
              placeholder={currentTexts.goalName}
              value={goalName}
              onChangeText={setGoalName}
            />
            <TextInput
              style={styles.input}
              placeholder={currentTexts.targetAmount}
              keyboardType="numeric"
              value={targetAmount}
              onChangeText={setTargetAmount}
            />
            <TextInput
              style={styles.input}
              placeholder={currentTexts.targetDate}
              value={targetDate}
              onChangeText={setTargetDate}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>{currentTexts.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleAddGoal}
              >
                <Text style={styles.buttonText}>{currentTexts.saveGoal}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Contribution Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={contributionModalVisible}
        onRequestClose={() => setContributionModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{`${
              currentTexts.contributeTo
            }: ${selectedGoal?.name || ""}`}</Text>
            <TextInput
              style={styles.input}
              placeholder={currentTexts.contributionAmount}
              keyboardType="numeric"
              value={contributionAmount}
              onChangeText={setContributionAmount}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setContributionModalVisible(false)}
              >
                <Text style={styles.buttonText}>{currentTexts.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleContributeToGoal}
              >
                <Text style={styles.buttonText}>{currentTexts.contribute}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 24, color: "#ffffff", fontWeight: "bold" },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginRight: 40,
  },
  content: { padding: 20, paddingBottom: 100 },
  noGoalsText: { fontSize: 16, color: "#7f8c8d", textAlign: "center" },
  goalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  goalName: { fontSize: 18, fontWeight: "bold", color: "#2c3e50" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#ecf0f1",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: { height: "100%", borderRadius: 5 },
  amountRow: { flexDirection: "row", justifyContent: "space-between" },
  amountText: { fontSize: 14, color: "#34495e" },
  projectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
    paddingTop: 8,
  },
  projectionText: { fontSize: 12, color: "#7f8c8d", fontStyle: "italic" },
  tipsCard: {
    backgroundColor: "#eaf5ff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderLeftColor: "#667eea",
    borderLeftWidth: 5,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  tipItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  tipIcon: { fontSize: 18, marginRight: 10, marginTop: 2 },
  tipText: { flex: 1, fontSize: 14, color: "#34495e", lineHeight: 20 },
  suggestionTipItem: {
    backgroundColor: "#e0fff0",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#27ae60",
    marginHorizontal: -10,
  },
  addButton: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: "#7f8c8d" },
  saveButton: { backgroundColor: "#667eea" },
  buttonText: { color: "white", fontWeight: "bold" },
});

export default SavingsGoalsScreen;
