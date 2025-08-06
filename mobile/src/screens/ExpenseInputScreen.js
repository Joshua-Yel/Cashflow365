import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import BottomNav from "../navigation/BottomNav";
import { auth, db, app } from "../firebaseConfig";
import { ref, push, serverTimestamp, onValue } from "firebase/database";
import useExpenseAI from "../hooks/useExpenseAI";

const { width } = Dimensions.get("window");

const texts = {
  EN: {
    title: "Add Expense",
    amount: "Amount",
    category: "Category",
    description: "Description (Optional)",
    recurring: "Recurring Expense?",
    frequency: "Frequency",
    aiInsights: "AI Financial Insights",
    predictedImpact: "Predicted Impact",
    suggestions: "Smart Suggestions",
    budgetWarning: "Budget Alert",
    saveExpense: "Save Expense",
    quickInput: "Quick Input Options",
    aiAnalyzing: "AI is analyzing your expense...",
    frequencies: {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      yearly: "Yearly",
    },
  },
  FIL: {
    title: "Magdagdag ng Gastos",
    amount: "Halaga",
    category: "Kategorya",
    description: "Deskripsyon (Optional)",
    recurring: "Paulit-ulit na Gastos?",
    frequency: "Gaano kadalas",
    aiInsights: "AI Financial Insights",
    predictedImpact: "Predicted Impact",
    suggestions: "Mga Mungkahi",
    budgetWarning: "Budget Alert",
    saveExpense: "I-save ang Gastos",
    quickInput: "Mabilis na Paglagay",
    aiAnalyzing: "Sinusuri ng AI ang inyong gastos...",
    frequencies: {
      daily: "Araw-araw",
      weekly: "Linggo-linggo",
      monthly: "Buwan-buwan",
      yearly: "Taun-taon",
    },
  },
};

const categoryLabels = {
  EN: {
    food: "Food",
    transport: "Transportation",
    bills: "Bills",
    medicine: "Medicine",
    education: "Education",
    emergency: "Emergency",
    other: "Other",
  },
  FIL: {
    food: "Pagkain",
    transport: "Transportasyon",
    bills: "Bills",
    medicine: "Gamot",
    education: "Pag-aaral",
    emergency: "Emergency",
    other: "Iba pa",
  },
};

const ExpenseInputScreen = ({ navigation }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("EN");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [fadeAnim] = useState(new Animated.Value(1)); // Start at 1 for simplicity with hook
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Base category definitions
  const baseCategories = [
    { id: "food", budget: 5000, icon: "🍽️" },
    { id: "transport", budget: 2000, icon: "🚌" },
    { id: "bills", budget: 3500, icon: "💡" },
    { id: "medicine", budget: 1500, icon: "🏥" },
    { id: "education", budget: 2500, icon: "📚" },
    { id: "emergency", budget: 1000, icon: "🚨" },
  ];
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const expensesRef = ref(db, `users/${user.uid}/expenses`);
    const unsubscribe = onValue(expensesRef, (snapshot) => {
      const expensesData = snapshot.val() || {};
      const expensesList = Object.values(expensesData);

      const spentByCategory = expensesList.reduce((acc, expense) => {
        if (expense.category) {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        }
        return acc;
      }, {});

      const updatedCategories = baseCategories.map((cat) => ({
        ...cat,
        spent: spentByCategory[cat.id] || 0,
        label: `${cat.icon} ${categoryLabels[language][cat.id]}`,
      }));

      setCategories(updatedCategories);
    });

    return () => unsubscribe();
  }, [language]);

  const currentTexts = texts[language];

  // --- AI-Powered Expense Analysis Hook ---
  const {
    isLoading: isAILoading,
    suggestions: aiSuggestions,
    budgetWarning,
    predictedImpact,
    showInsights: showAIInsights,
    resetAIState,
  } = useExpenseAI(
    amount,
    category,
    categories,
    language,
    categoryLabels,
    texts
  );

  const handleSaveExpense = async () => {
    if (!amount || !category) {
      Alert.alert(
        "Error",
        language === "EN"
          ? "Please fill in the amount and select a category"
          : "Pakipunan ang halaga at pumili ng kategorya"
      );
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert(
        "Authentication Error",
        "You must be logged in to save an expense."
      );
      return;
    }

    setIsSaving(true);

    const expenseData = {
      amount: parseFloat(amount),
      category,
      description,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : null,
      createdAt: serverTimestamp(),
    };

    try {
      const expensesRef = ref(db, `users/${user.uid}/expenses`);
      await push(expensesRef, expenseData);

      Alert.alert(
        "Success",
        language === "EN" ? "Expense saved!" : "Na-save ang gastos!"
      );

      // Reset form
      setAmount("");
      setCategory("");
      setDescription("");
      setIsRecurring(false);
      resetAIState();
    } catch (error) {
      console.error("Firebase Write Error:", error);
      Alert.alert(
        "Error",
        "There was an issue saving your expense. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "FIL" : "EN");
  };

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <View style={styles.screenHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{currentTexts.title}</Text>
        <TouchableOpacity
          onPress={toggleLanguage}
          style={styles.languageToggle}
        >
          <Text style={styles.languageText}>{language}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.screenContent}>
        {/* Budget Warning */}
        {budgetWarning && (
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>{budgetWarning.message}</Text>
          </View>
        )}

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{currentTexts.amount}</Text>
          <TextInput
            style={styles.inputField}
            placeholder="₱150"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
            placeholderTextColor="#888"
          />
        </View>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{currentTexts.category}</Text>
          <View style={styles.categoryContainer}>
            {categories.map((item) => {
              const budgetUsage = (item.spent / item.budget) * 100;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.categoryOption,
                    category === item.id && styles.selectedCategory,
                  ]}
                  onPress={() => setCategory(item.id)}
                >
                  <Text style={styles.categoryIcon}>{item.label}</Text>
                  <View style={styles.budgetIndicator}>
                    <View
                      style={[
                        styles.budgetBar,
                        { width: `${Math.min(budgetUsage, 100)}%` },
                        {
                          backgroundColor:
                            budgetUsage > 85
                              ? "#e74c3c"
                              : budgetUsage > 70
                                ? "#f39c12"
                                : "#27ae60",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.budgetText}>
                    ₱{item.spent}/₱{item.budget}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recurring Expense Toggle */}
        <View style={styles.inputGroup}>
          <View style={styles.recurringContainer}>
            <Text style={styles.inputLabel}>{currentTexts.recurring}</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isRecurring && styles.toggleButtonActive,
              ]}
              onPress={() => setIsRecurring(!isRecurring)}
            >
              <Text
                style={[
                  styles.toggleText,
                  isRecurring && styles.toggleTextActive,
                ]}
              >
                {isRecurring ? "✓" : "○"}
              </Text>
            </TouchableOpacity>
          </View>

          {isRecurring && (
            <View style={styles.frequencyContainer}>
              <Text style={styles.inputLabel}>{currentTexts.frequency}</Text>
              <View style={styles.frequencyOptions}>
                {Object.entries(currentTexts.frequencies).map(
                  ([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.frequencyOption,
                        recurringFrequency === key && styles.selectedFrequency,
                      ]}
                      onPress={() => setRecurringFrequency(key)}
                    >
                      <Text style={styles.frequencyText}>{label}</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          )}
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{currentTexts.description}</Text>
          <TextInput
            style={styles.inputField}
            placeholder={
              language === "EN" ? "Breakfast at the corner" : "Almusal sa kanto"
            }
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="#888"
          />
        </View>

        {/* AI Insights Card */}
        {showAIInsights && (
          <Animated.View style={[styles.aiInsightsCard, { opacity: fadeAnim }]}>
            <Text style={styles.aiTitle}>🧠 {currentTexts.aiInsights}</Text>

            {predictedImpact && (
              <View style={styles.impactSection}>
                <Text style={styles.sectionTitle}>
                  {currentTexts.predictedImpact}
                </Text>
                <View style={styles.impactStats}>
                  <View style={styles.impactStat}>
                    <Text style={styles.impactValue}>
                      {predictedImpact.budgetUsage.toFixed(0)}%
                    </Text>
                    <Text style={styles.impactLabel}>Budget Used</Text>
                  </View>
                  <View style={styles.impactStat}>
                    <Text style={styles.impactValue}>
                      ₱{predictedImpact.remainingBudget}
                    </Text>
                    <Text style={styles.impactLabel}>Remaining</Text>
                  </View>
                  <View style={styles.impactStat}>
                    <Text style={styles.impactValue}>
                      {predictedImpact.daysUntilPayday}
                    </Text>
                    <Text style={styles.impactLabel}>Days to Payday</Text>
                  </View>
                </View>
              </View>
            )}

            {aiSuggestions.length > 0 && (
              <View style={styles.suggestionsSection}>
                <Text style={styles.sectionTitle}>
                  {currentTexts.suggestions}
                </Text>
                {aiSuggestions.map((suggestion, index) => {
                  if (suggestion.type === "loading") {
                    return (
                      <View
                        key={index}
                        style={styles.loadingSuggestion}
                      >
                        <ActivityIndicator
                          size="small"
                          color="#4c51bf"
                        />
                        <Text style={styles.loadingText}>
                          {suggestion.text}
                        </Text>
                      </View>
                    );
                  }
                  return (
                    <View
                      key={index}
                      style={[
                        styles.suggestion,
                        styles[`suggestion${suggestion.type}`],
                      ]}
                    >
                      <Text style={styles.suggestionText}>
                        {suggestion.text}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </Animated.View>
        )}

        {/* Quick Input Options */}
        <View style={styles.quickOptionsCard}>
          <Text style={styles.quickOptionsText}>
            {currentTexts.quickInput}:
          </Text>
          <View style={styles.quickOptions}>
            <TouchableOpacity
              style={styles.quickOptionBtn}
              onPress={() =>
                Alert.alert(
                  "Photo Receipt Scanner",
                  "AI will extract expense details from your receipt"
                )
              }
            >
              <Text style={styles.quickOptionText}>📷 Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickOptionBtn}
              onPress={() =>
                Alert.alert(
                  "Voice Input",
                  "Say your expense and AI will categorize it"
                )
              }
            >
              <Text style={styles.quickOptionText}>🎤 Voice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickOptionBtn}
              onPress={() =>
                Alert.alert("SMS Scanner", "AI will read your transaction SMS")
              }
            >
              <Text style={styles.quickOptionText}>💬 SMS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Expense Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveExpense}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {currentTexts.saveExpense}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
    color: "#333",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  languageToggle: {
    padding: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
  },
  languageText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  screenContent: {
    paddingBottom: 100,
  },
  warningCard: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeaa7",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: "#856404",
    fontWeight: "bold",
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputField: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingLeft: 15,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fafafa",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    width: "48%",
    padding: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fafafa",
  },
  selectedCategory: {
    backgroundColor: "#27ae60",
    borderColor: "#27ae60",
  },
  categoryIcon: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
    color: "#333",
  },
  budgetIndicator: {
    width: "100%",
    height: 4,
    backgroundColor: "#eee",
    borderRadius: 2,
    marginBottom: 4,
  },
  budgetBar: {
    height: "100%",
    borderRadius: 2,
  },
  budgetText: {
    fontSize: 10,
    color: "#666",
  },
  recurringContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  toggleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#27ae60",
    borderColor: "#27ae60",
  },
  toggleText: {
    fontSize: 16,
    color: "#ddd",
  },
  toggleTextActive: {
    color: "#fff",
  },
  frequencyContainer: {
    marginTop: 10,
  },
  frequencyOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  frequencyOption: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    backgroundColor: "#fafafa",
  },
  selectedFrequency: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  frequencyText: {
    fontSize: 12,
    color: "#333",
  },
  aiInsightsCard: {
    backgroundColor: "#f8f9ff",
    borderWidth: 1,
    borderColor: "#e3e8ff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4c51bf",
    marginBottom: 15,
  },
  impactSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: 8,
  },
  impactStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  impactStat: {
    alignItems: "center",
  },
  impactValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2d3748",
  },
  impactLabel: {
    fontSize: 12,
    color: "#718096",
  },
  suggestionsSection: {
    marginTop: 10,
  },
  suggestion: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionwarning: {
    backgroundColor: "#fed7d7",
    borderLeftWidth: 4,
    borderLeftColor: "#e53e3e",
  },
  suggestiontip: {
    backgroundColor: "#d4edda",
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  suggestioninsight: {
    backgroundColor: "#cce7ff",
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  loadingSuggestion: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 13,
    color: "#4a5568",
  },
  suggestionText: {
    fontSize: 13,
    color: "#2d3748",
  },
  quickOptionsCard: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  quickOptionsText: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 10,
    fontWeight: "500",
  },
  quickOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickOptionBtn: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    width: "30%",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  quickOptionText: {
    fontSize: 12,
    color: "#495057",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ExpenseInputScreen;
