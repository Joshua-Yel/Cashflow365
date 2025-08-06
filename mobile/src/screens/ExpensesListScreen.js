import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import BottomNav from "../navigation/BottomNav";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";
import useExpenseListAI from "../hooks/useExpenseListAI";

const { width, height } = Dimensions.get("window");

const ExpensesListScreen = () => {
  const navigation = useNavigation();
  const [language, setLanguage] = useState("en"); // 'en' or 'fil'
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [showPredictions, setShowPredictions] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [profile, setProfile] = useState(null);
  const [categoryBudgets, setCategoryBudgets] = useState([]);

  const translations = {
    en: {
      title: "Expenses",
      thisWeek: "This Week",
      thisMonth: "This Month",
      food: "Food",
      transport: "Transport",
      utilities: "Utilities",
      salary: "Salary",
      today: "Today",
      yesterday: "Yesterday",
      categories: "Categories This Month",
      predictions: "AI Predictions",
      riskAlert: "Risk Alert",
      budgetTip: "Budget Tip",
      addExpense: "Add Expense",
      predictedShortfall: "Predicted shortfall next week",
      schoolFeesWarning: "School enrollment fees due in 2 weeks",
      savingsTip: "Try cooking at home 3 more days to save ₱450",
      upcomingBills: "Upcoming Bills",
      waterBill: "Water Bill",
      internetBill: "Internet Bill",
      home: "Home",
      predict: "Predict",
      learn: "Learn",
      settings: "Settings",
    },
    fil: {
      title: "Mga Gastos",
      thisWeek: "Ngayong Linggo",
      thisMonth: "Ngayong Buwan",
      food: "Pagkain",
      transport: "Pamasahe",
      utilities: "Kuryente",
      salary: "Sahod",
      today: "Ngayon",
      yesterday: "Kahapon",
      categories: "Kategorya Ngayong Buwan",
      predictions: "AI na Hula",
      riskAlert: "Babala sa Panganib",
      budgetTip: "Payo sa Budget",
      addExpense: "Magdagdag ng Gastos",
      predictedShortfall: "Kulang sa pera next week",
      schoolFeesWarning: "Bayad sa eskwela sa loob ng 2 linggo",
      savingsTip:
        "Subukan magluto sa bahay ng 3 araw pa para makatipid ng ₱450",
      upcomingBills: "Paparating na Bills",
      waterBill: "Tubig",
      internetBill: "Internet",
      home: "Tahanan",
      predict: "Hula",
      learn: "Matuto",
      settings: "Settings",
    },
  };

  const t = translations[language];

  // Base category definitions with suggested percentage allocations
  const baseCategories = [
    { id: "food", budgetPercent: 0.25 },
    { id: "transport", budgetPercent: 0.1 },
    { id: "bills", budgetPercent: 0.2 },
    { id: "medicine", budgetPercent: 0.05 },
    { id: "education", budgetPercent: 0.05 },
    { id: "emergency", budgetPercent: 0.05 },
  ];

  const categoryLabels = {
    en: {
      food: "Food",
      transport: "Transportation",
      bills: "Bills",
      medicine: "Medicine",
      education: "Education",
      emergency: "Emergency",
      other: "Other",
    },
    fil: {
      food: "Pagkain",
      transport: "Transportasyon",
      bills: "Bills",
      medicine: "Gamot",
      education: "Pag-aaral",
      emergency: "Emergency",
      other: "Iba pa",
    },
  };

  // For icons and colors, separate from budget logic
  // This ensures we can display any category, even if not in the budget plan

  const categoryDetails = {
    food: {
      icon: "🍽️",
      color: "#e74c3c",
      label: { en: "Food", fil: "Pagkain" },
    },
    transport: {
      icon: "🚌",
      color: "#3498db",
      label: { en: "Transport", fil: "Pamasahe" },
    },
    bills: {
      icon: "💡",
      color: "#f39c12",
      label: { en: "Utilities", fil: "Kuryente" },
    },
    medicine: {
      icon: "🏥",
      color: "#9b59b6",
      label: { en: "Medicine", fil: "Gamot" },
    },
    education: {
      icon: "📚",
      color: "#1abc9c",
      label: { en: "Education", fil: "Pag-aaral" },
    },
    emergency: {
      icon: "🚨",
      color: "#e67e22",
      label: { en: "Emergency", fil: "Emergency" },
    },
  };

  // Fetch user profile and all expenses
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const profileRef = ref(db, `users/${user.uid}/profile`);
    const profileUnsubscribe = onValue(profileRef, (snapshot) => {
      const data = snapshot.val();
      setProfile(data);
      if (data?.language) {
        setLanguage(data.language.toLowerCase());
      }
    });

    const expensesRef = ref(db, `users/${user.uid}/expenses`);
    const expensesUnsubscribe = onValue(expensesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const expensesList = Object.keys(data)
          .map((key) => ({
            id: key,
            ...data[key],
          }))
          .sort((a, b) => b.createdAt - a.createdAt); // sort by most recent
        setExpenses(expensesList);

        // Calculate this week's total
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);

        const weeklyExpenses = expensesList.filter(
          (exp) => exp.createdAt >= startOfWeek.getTime()
        );
        const total = weeklyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        setWeeklyTotal(total);
      } else {
        setExpenses([]);
        setWeeklyTotal(0);
      }
      setLoading(false);
    });

    return () => {
      profileUnsubscribe();
      expensesUnsubscribe();
    };
  }, []);

  // Calculate category budgets dynamically when profile or expenses change
  useEffect(() => {
    if (!profile || !expenses) return;

    const spentByCategory = expenses.reduce((acc, expense) => {
      if (expense.category) {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      }
      return acc;
    }, {});

    const monthlyIncome = profile?.monthlyIncome || 0;
    const updatedCategoryBudgets = baseCategories.map((cat) => ({
      ...cat,
      name: `${categoryDetails[cat.id]?.icon || "💸"} ${
        categoryLabels[language][cat.id]
      }`,
      budget: monthlyIncome * cat.budgetPercent,
      spent: spentByCategory[cat.id] || 0,
      predicted: (spentByCategory[cat.id] || 0) * 1.2, // Simple prediction for now
      color: categoryDetails[cat.id]?.color || "#ccc",
    }));

    setCategoryBudgets(updatedCategoryBudgets);
  }, [profile, expenses, language]);

  // --- AI-Powered Predictions Hook ---
  const { isLoading: isAiLoading, predictions } = useExpenseListAI(
    profile,
    expenses,
    weeklyTotal,
    language,
    loading
  );

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "fil" : "en");
  };

  const showPredictionDetails = (prediction) => {
    Alert.alert(
      prediction.title,
      prediction.message +
        (prediction.amount ? `\n\nAmount: ${prediction.amount}` : ""),
      [{ text: "OK" }]
    );
  };

  // This is now hardcoded as the AI will generate more dynamic upcoming challenges.
  // This can be replaced later with a more robust local calculation if needed.
  const upcomingBills = [
    {
      name: t.waterBill,
      icon: "💧",
      dueDate: "July 28",
      amount: "₱450",
      predicted: true,
    },
    {
      name: t.internetBill,
      icon: "📡",
      dueDate: "July 30",
      amount: "₱1,299",
      predicted: false,
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator
          size="large"
          color="#2c3e50"
        />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2c3e50"
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon
            name="arrow-left"
            color="white"
            size={24}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.title}</Text>
        <TouchableOpacity
          style={styles.languageToggle}
          onPress={toggleLanguage}
        >
          <Text style={styles.languageText}>
            {language === "en" ? "FIL" : "EN"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Predictions Section */}
        {showPredictions && (
          <View style={styles.predictionsSection}>
            <Text style={styles.sectionTitle}>🧠 {t.predictions}</Text>
            {isAiLoading ? (
              <ActivityIndicator
                size="small"
                color="#2c3e50"
              />
            ) : (
              predictions.map((prediction, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.predictionCard,
                    { borderLeftColor: prediction.color },
                  ]}
                  onPress={() => showPredictionDetails(prediction)}
                >
                  <View style={styles.predictionHeader}>
                    <Text style={styles.predictionIcon}>{prediction.icon}</Text>
                    <View style={styles.predictionContent}>
                      <Text style={styles.predictionTitle}>
                        {prediction.title}
                      </Text>
                      <Text style={styles.predictionMessage}>
                        {prediction.message}
                      </Text>
                    </View>
                    {prediction.amount && (
                      <Text
                        style={[
                          styles.predictionAmount,
                          { color: prediction.color },
                        ]}
                      >
                        {prediction.amount}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Week Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>{t.thisWeek}</Text>
            <Text style={styles.summaryAmount}>
              ₱{weeklyTotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryPrediction}>
            <Icon
              name="line-chart"
              color="#e74c3c"
              size={16}
            />
            <Text style={styles.predictionText}>
              Predicted: ₱3,200 (62% likely to exceed budget)
            </Text>
          </View>
        </View>

        {/* Expenses List */}
        <View style={styles.expensesSection}>
          {expenses.length === 0 ? (
            <Text style={styles.noExpensesText}>No expenses logged yet.</Text>
          ) : (
            expenses.map((expense) => {
              const catInfo = categoryDetails[expense.category] || {};
              return (
                <View
                  key={expense.id}
                  style={styles.expenseItem}
                >
                  <View style={styles.expenseLeft}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: catInfo.color || "#ccc" },
                      ]}
                    >
                      <Text style={styles.iconText}>
                        {catInfo.icon || "💸"}
                      </Text>
                    </View>
                    <View style={styles.expenseDetails}>
                      <Text style={styles.expenseCategory}>
                        {categoryLabels[language][expense.category] ||
                          expense.category}
                      </Text>
                      <Text style={styles.expenseTime}>
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.amount, { color: "#e74c3c" }]}>
                    -₱{expense.amount.toLocaleString()}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* Categories Progress */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>{t.categories}</Text>
          {categoryBudgets.map((category, index) => (
            <View
              key={index}
              style={styles.categoryBudget}
            >
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.budgetText}>
                  ₱{category.spent.toLocaleString()} / ₱
                  {category.budget.toLocaleString()}
                </Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(category.spent / category.budget) * 100}%`,
                        backgroundColor: category.color,
                      },
                    ]}
                  />
                  {/* Predicted spending line */}
                  <View
                    style={[
                      styles.predictionLine,
                      {
                        left: `${(category.predicted / category.budget) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.predictionLabel}>
                AI Prediction: ₱{category.predicted.toLocaleString()} by month
                end
              </Text>
            </View>
          ))}
        </View>

        {/* Upcoming Bills */}
        <View style={styles.upcomingSection}>
          <Text style={styles.sectionTitle}>
            <Icon
              name="calendar"
              size={18}
              color="#2c3e50"
            />{" "}
            {t.upcomingBills}
          </Text>
          {upcomingBills.map((bill, index) => (
            <View
              key={index}
              style={styles.billItem}
            >
              <View style={styles.billLeft}>
                <Text style={styles.billIcon}>{bill.icon}</Text>
                <View>
                  <Text style={styles.billName}>{bill.name}</Text>
                  <Text style={styles.billDate}>Due: {bill.dueDate}</Text>
                </View>
              </View>
              <View style={styles.billRight}>
                <Text style={styles.billAmount}>{bill.amount}</Text>
                {bill.predicted && (
                  <Text style={styles.predictedLabel}>AI Predicted</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Add Expense Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("ExpenseInputScreen")}
        >
          <Icon
            name="plus"
            color="white"
            size={24}
          />
          <Text style={styles.addButtonText}>{t.addExpense}</Text>
        </TouchableOpacity>
      </ScrollView>
      {/* Bottom Navigation */}
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#2c3e50",
    paddingTop: StatusBar.currentHeight || 40,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  languageToggle: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  languageText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  predictionsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  predictionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  predictionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  predictionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  predictionContent: {
    flex: 1,
  },
  predictionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  predictionMessage: {
    fontSize: 12,
    color: "#7f8c8d",
    lineHeight: 16,
  },
  predictionAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  summarySection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  summaryPrediction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffeaa7",
    padding: 10,
    borderRadius: 8,
  },
  predictionText: {
    fontSize: 12,
    color: "#d35400",
    marginLeft: 8,
    fontWeight: "600",
  },
  expensesSection: {
    marginBottom: 20,
  },
  noExpensesText: {
    textAlign: "center",
    color: "#7f8c8d",
    marginTop: 20,
    fontStyle: "italic",
  },
  expenseItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  iconText: {
    fontSize: 18,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 2,
  },
  expenseTime: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoryBudget: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
  },
  budgetText: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "bold",
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#ecf0f1",
    borderRadius: 4,
    position: "relative",
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  predictionLine: {
    position: "absolute",
    top: -2,
    width: 2,
    height: 12,
    backgroundColor: "#2c3e50",
  },
  predictionLabel: {
    fontSize: 11,
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  upcomingSection: {
    marginBottom: 20,
  },
  billItem: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  billLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  billIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  billName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  billDate: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  billRight: {
    alignItems: "flex-end",
  },
  billAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e74c3c",
  },
  predictedLabel: {
    fontSize: 10,
    color: "#27ae60",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#3498db",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 80,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: "#e8f4fd",
    borderRadius: 12,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 10,
    color: "#7f8c8d",
    fontWeight: "600",
  },
  activeNavLabel: {
    color: "#3498db",
    fontWeight: "bold",
  },
});

export default ExpensesListScreen;
