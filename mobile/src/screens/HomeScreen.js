import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import BottomNav from "../navigation/BottomNav";
import AIPredictionsSection from "../components/dashboard/AI-prediction-card";
import FinancialHealthScore from "../components/dashboard/Financial-health-score";
import CashflowForecast from "../components/dashboard/Cashflow-forecast";
import QuickActionsSection from "../components/dashboard/QuickActionsSection";
// import AiSmartTipCard from "../components/dashboard/Ai-smart-tips";
import { auth, db } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";
import useDashboardAI from "../hooks/useDashboardAI";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [language, setLanguage] = useState("EN");
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);

  const [initialBalance, setInitialBalance] = useState(0);
  const [incomeTransactions, setIncomeTransactions] = useState([]);
  const [expenseTransactions, setExpenseTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  // Default placeholder values
  const [currentBalance, setCurrentBalance] = useState(0);
  const [predictedShortfall, setPredictedShortfall] = useState(0);

  const [cashFlowPrediction, setCashFlowPrediction] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const uid = user.uid;
    const subscriptions = [];

    // Profile Listener
    const profileRef = ref(db, `users/${uid}/profile`);
    subscriptions.push(
      onValue(
        profileRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUserName(data.name || "User");
            setInitialBalance(data.monthlyIncome || 0);
          }
        },
        (error) => console.error("Firebase profile read error:", error)
      )
    );

    // Income Listener
    const incomeRef = ref(db, `users/${uid}/income`);
    subscriptions.push(
      onValue(
        incomeRef,
        (snapshot) => {
          const incomeData = snapshot.val() || {};
          const transactions = Object.values(incomeData);
          setIncomeTransactions(transactions);
          const calculatedIncome = transactions.reduce(
            (sum, item) => sum + (item.amount || 0),
            0
          );
          setTotalIncome(calculatedIncome);
        },
        (error) => console.error("Firebase income read error:", error)
      )
    );

    // Expenses Listener
    const expensesRef = ref(db, `users/${uid}/expenses`);
    subscriptions.push(
      onValue(
        expensesRef,
        (snapshot) => {
          const expensesData = snapshot.val() || {};
          const transactions = Object.values(expensesData);
          setExpenseTransactions(transactions);
          const calculatedExpenses = transactions.reduce(
            (sum, item) => sum + (item.amount || 0),
            0
          );
          setTotalExpenses(calculatedExpenses);
        },
        (error) => console.error("Firebase expenses read error:", error)
      )
    );

    // Set placeholder data for other sections for now
    setLoading(false); // Set loading to false after listeners are attached

    // Cleanup function
    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [language]); // Rerun if language changes to update default text

  // Effect to calculate balance
  useEffect(() => {
    setCurrentBalance(initialBalance + totalIncome - totalExpenses);
  }, [initialBalance, totalIncome, totalExpenses]);

  // Effect to calculate cash flow forecast
  useEffect(() => {
    if (loading) return; // Don't calculate until data is loaded

    const calculateForecast = () => {
      const recurringIncome = incomeTransactions.filter((t) => t.isRecurring);
      const recurringExpenses = expenseTransactions.filter(
        (t) => t.isRecurring
      );

      const forecast = [];
      let weekBalance = currentBalance;

      const periodNames = {
        EN: ["This Week", "Next Week", "Week 3", "Week 4"],
        FIL: [
          "Ngayong Linggo",
          "Susunod na Linggo",
          "Ika-3 Linggo",
          "Ika-4 na Linggo",
        ],
      };

      for (let i = 0; i < 4; i++) {
        let weeklyIncome = 0;
        let weeklyExpenses = 0;

        const addTransactionToTotals = (transactions, isIncome) => {
          transactions.forEach((t) => {
            let weeklyAmount = 0;
            if (t.recurringFrequency === "daily") weeklyAmount = t.amount * 7;
            if (t.recurringFrequency === "weekly") weeklyAmount = t.amount;
            if (t.recurringFrequency === "monthly") weeklyAmount = t.amount / 4; // Approximation
            if (t.recurringFrequency === "yearly") weeklyAmount = t.amount / 52; // Approximation

            if (isIncome) weeklyIncome += weeklyAmount;
            else weeklyExpenses += weeklyAmount;
          });
        };

        addTransactionToTotals(recurringIncome, true);
        addTransactionToTotals(recurringExpenses, false);

        weekBalance += weeklyIncome - weeklyExpenses;

        forecast.push({
          period: periodNames[language][i] || `Week ${i + 1}`,
          income: Math.round(weeklyIncome),
          expenses: Math.round(weeklyExpenses),
          balance: Math.round(weekBalance),
        });
      }
      setCashFlowPrediction(forecast);

      // Calculate the predicted shortfall from the forecast data.
      // Find the lowest balance in the upcoming weeks.
      const lowestFutureBalance = forecast.reduce(
        (min, p) => (p.balance < min ? p.balance : min),
        Infinity
      );
      const shortfall =
        lowestFutureBalance < 0 ? Math.abs(lowestFutureBalance) : 0;
      setPredictedShortfall(shortfall);
    };

    calculateForecast();
  }, [
    currentBalance,
    incomeTransactions,
    expenseTransactions,
    language,
    loading,
  ]);

  // --- AI-Powered Dashboard Analysis Hook ---
  const { isLoading: isAiLoading, alerts } = useDashboardAI(
    currentBalance,
    predictedShortfall,
    totalIncome,
    totalExpenses,
    userName,
    language,
    loading
  );

  // Local state to manage the 'seen' status of alerts, populated by the AI hook
  const [displayAlerts, setDisplayAlerts] = useState([]);
  useEffect(() => {
    if (alerts) {
      setDisplayAlerts(alerts);
    }
  }, [alerts]);

  // Handle Language Toggle
  const toggleLanguage = () => {
    const newLang = language === "EN" ? "FIL" : "EN";
    setLanguage(newLang);
  };

  // This function should be called from your QuickActionsSection component
  const handleCreateBudget = () => {
    navigation.navigate("BudgetPlannerScreen");
  };

  // Handle Alert Toggle
  const toggleAlert = (alertId) => {
    setDisplayAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, seen: !alert.seen } : alert
      )
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2c3e50"
        />
        <Text>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <StatusBar barStyle="light-content" />

        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.appTitle}>CASHFLOW365</Text>
            <View style={styles.headerRight}>
              {/* <TouchableOpacity
                onPress={() => navigation.navigate("ProfileScreen")}
                testID="profile-button"
                style={styles.profileButton}
                activeOpacity={0.7}
              >
                <View style={styles.profileIconContainer}>
                  <Text style={styles.profileIcon}>👤</Text>
                </View>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={styles.languageToggle}
                onPress={toggleLanguage}
              >
                <Text style={styles.languageText}>{language}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.greeting}>
            {language === "EN"
              ? `Good morning, ${userName}!`
              : `Magandang umaga, ${userName}!`}
          </Text>

          {/* <View style={styles.notificationContainer}>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
            {alerts.some((alert) => !alert.seen) && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertText}>
                  {alerts.filter((alert) => !alert.seen).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          </View> */}
        </View>

        {/* Financial Health Score */}
        <FinancialHealthScore
          language={language}
          currentBalance={currentBalance}
          predictedShortfall={predictedShortfall}
        />

        {/* AI Predictions & Alerts */}
        <AIPredictionsSection
          alerts={displayAlerts}
          language={language}
          onToggleAlert={toggleAlert}
        />

        {/* Cash Flow Forecast */}
        <CashflowForecast
          language={language}
          data={cashFlowPrediction}
        />

        {/* Quick Actions */}
        <QuickActionsSection
          language={language}
          navigation={navigation}
          onCreateBudget={handleCreateBudget}
        />

        {/* Bottom spacing for navigation */}
        <View style={styles.bottomSpacing} />
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#2c3e50",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileButton: {
    marginRight: 10,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    fontSize: 24,
    color: "#ecf0f1",
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ecf0f1",
  },
  languageToggle: {
    backgroundColor: "#34495e",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  languageText: {
    color: "#ecf0f1",
    fontWeight: "bold",
  },
  greeting: {
    fontSize: 16,
    color: "#bdc3c7",
    marginBottom: 5,
  },
  notificationButton: {
    position: "relative",
  },
  notificationIcon: {
    fontSize: 24,
    color: "#ecf0f1",
  },
  alertBadge: {
    position: "absolute",
    right: -8,
    top: -8,
    backgroundColor: "#e74c3c",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  alertText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
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
  emergencySection: {
    backgroundColor: "#e74c3c",
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  emergencyTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  emergencyButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  emergencyButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  bottomSpacing: {
    height: 100,
  },
});

export default HomeScreen;
