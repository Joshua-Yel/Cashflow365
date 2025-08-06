import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import BottomNav from "../navigation/BottomNav";
import MainPredictionCard from "../components/predictions/Main-prediction-card";
import AiRecommendationCard from "../components/predictions/Ai-recommendation-card";
import UpcomingChallengesCard from "../components/predictions/Upcoming-challenges-card";
import ActionButtons from "../components/predictions/Action-buttons";
import RiskLevelIndicator from "../components/predictions/Risk-level-indicator-card";
import { auth, db } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";
import usePredictionsAI from "../hooks/usePredictionsAI";

const { width } = Dimensions.get("window");
const chartWidth = width - 40;

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#ffa726",
  },
  propsForBackgroundLines: {
    strokeDasharray: "5,5",
    stroke: "#e0e0e0",
  },
};

// --- Helper Functions for AI Predictions ---

const generateHistoricalChartData = (income, expenses) => {
  const days = 14;
  const dayLabels = [];
  const incomePoints = new Array(days).fill(0);
  const expensePoints = new Array(days).fill(0);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - i));
    dayLabels.push(
      `${date.toLocaleString("default", { month: "short" })} ${date.getDate()}`
    );
  }

  const startTime = new Date(today);
  startTime.setDate(today.getDate() - (days - 1));
  startTime.setHours(0, 0, 0, 0);
  const startTimeMs = startTime.getTime();

  income.forEach((t) => {
    if (t.createdAt >= startTimeMs) {
      const dayIndex = Math.floor(
        (t.createdAt - startTimeMs) / (1000 * 60 * 60 * 24)
      );
      if (dayIndex >= 0 && dayIndex < days) {
        incomePoints[dayIndex] += t.amount;
      }
    }
  });

  expenses.forEach((t) => {
    if (t.createdAt >= startTimeMs) {
      const dayIndex = Math.floor(
        (t.createdAt - startTimeMs) / (1000 * 60 * 60 * 24)
      );
      if (dayIndex >= 0 && dayIndex < days) {
        expensePoints[dayIndex] += t.amount;
      }
    }
  });

  return {
    labels: dayLabels,
    datasets: [
      {
        data: incomePoints,
        color: (opacity = 1) => `rgba(39, 174, 96, ${opacity})`,
        strokeWidth: 2,
      },
      {
        data: expensePoints,
        color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };
};

const calculateRiskLevel = (income, expenses) => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const totalIncome = income
    .filter((i) => i.createdAt > oneMonthAgo.getTime())
    .reduce((sum, i) => sum + i.amount, 0);

  const totalExpenses = expenses
    .filter((e) => e.createdAt > oneMonthAgo.getTime())
    .reduce((sum, e) => sum + e.amount, 0);

  if (totalIncome === 0) {
    return totalExpenses > 0 ? 1 : 0;
  }

  const risk = totalExpenses / totalIncome;
  return Math.min(Math.max(risk, 0), 1); // Clamp between 0 and 1
};

const findUpcomingChallenges = (expenses, lang) => {
  // NOTE: This is a simplified model. A real implementation would need more robust
  // tracking of bill due dates rather than calculating from `createdAt`.
  const challenges = [];
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const recurringExpenses = expenses.filter((e) => e.isRecurring);

  recurringExpenses.forEach((expense) => {
    const nextDueDate = new Date(expense.createdAt);
    while (nextDueDate < today) {
      if (expense.recurringFrequency === "weekly") {
        nextDueDate.setDate(nextDueDate.getDate() + 7);
      } else if (expense.recurringFrequency === "monthly") {
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      } else if (expense.recurringFrequency === "yearly") {
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
      } else {
        break; // Ignore daily for challenges
      }
    }

    if (
      nextDueDate >= today &&
      nextDueDate <= nextMonth &&
      expense.recurringFrequency !== "daily"
    ) {
      let type = "info";
      if (expense.amount > 4000) {
        // Example threshold for a large expense
        type = "critical";
      } else if (nextDueDate <= sevenDaysFromNow) {
        type = "warning";
      }

      challenges.push({
        id: expense.id,
        date: `${nextDueDate.toLocaleString("default", {
          month: "short",
        })} ${nextDueDate.getDate()}`,
        title: expense.description || expense.category,
        estimate: expense.amount,
        type: type,
      });
    }
  });

  return challenges
    .sort(
      (a, b) =>
        new Date(a.date + " " + today.getFullYear()) -
        new Date(b.date + " " + today.getFullYear())
    )
    .slice(0, 3);
};

const PredictionScreen = ({ navigation }) => {
  const [language, setLanguage] = useState("EN");
  const [refreshing, setRefreshing] = useState(false);
  const [predictionData, setPredictionData] = useState(null);
  const [confidenceLevel, setConfidenceLevel] = useState(87);
  const [loading, setLoading] = useState(true);
  const [incomeTransactions, setIncomeTransactions] = useState([]);
  const [expenseTransactions, setExpenseTransactions] = useState([]);

  const texts = {
    EN: {
      title: "Financial Forecast",
      subtitle: "2-Week Financial Forecast",
      confidenceLevel: "Confidence Level",
      upcomingChallenges: "Upcoming Challenges",
      aiRecommendations: "AI Recommendations",
      viewDetails: "View Details",
      createPlan: "Create Plan",
      refreshing: "Updating predictions...",
      issues: "Issues",
      shortage: "Shortage",
      estimate: "Estimate",
      highUsage: "High usage",
      saveAmount: "Save",
      delay: "Delay",
      cookMore: "Cook more meals at home",
      useFan: "Use fan instead of AC next week",
      delayPhoneLoad: "Delay phone load budget by ₱500",
      income: "Income",
      expenses: "Expenses",
      riskTitle: "📊 Financial Risk Level",
      riskLabel: "Risk Level",
    },
    FIL: {
      title: "Hula sa Pananalapi",
      subtitle: "2-Linggo na Hula sa Pananalapi",
      confidenceLevel: "Antas ng Tiwala",
      upcomingChallenges: "Mga Darating na Hamon",
      aiRecommendations: "Mga Mungkahi ng AI",
      viewDetails: "Tingnan ang Detalye",
      createPlan: "Gumawa ng Plano",
      refreshing: "Nina-update ang mga hula...",
      issues: "Mga Suliranin",
      shortage: "Kulang",
      estimate: "Tantiya",
      highUsage: "Mataas na paggamit",
      saveAmount: "Matipid",
      delay: "Ipagpaliban",
      cookMore: "Magluto ng mas maraming pagkain sa bahay",
      useFan: "Gamitin ang electric fan sa halip na AC sa susunod na linggo",
      delayPhoneLoad: "Ipagpaliban ang phone load budget ng ₱500",
      income: "Kita",
      expenses: "Gastos",
      riskTitle: "📊 Antas ng Panganib sa Pananalapi",
      riskLabel: "Antas ng Panganib",
    },
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const uid = user.uid;
    const subscriptions = [];

    const incomeRef = ref(db, `users/${uid}/income`);
    subscriptions.push(
      onValue(incomeRef, (snapshot) => {
        const data = snapshot.val() || {};
        setIncomeTransactions(Object.values(data));
      })
    );

    const expensesRef = ref(db, `users/${uid}/expenses`);
    subscriptions.push(
      onValue(expensesRef, (snapshot) => {
        const data = snapshot.val() || {};
        const transactions = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setExpenseTransactions(transactions);
      })
    );

    return () => subscriptions.forEach((sub) => sub());
  }, []);

  // --- AI-Powered Recommendations Hook ---
  const { isLoading: isAiLoading, recommendations: aiRecommendations } =
    usePredictionsAI(
      expenseTransactions,
      predictionData?.riskLevel,
      language,
      loading
    );

  useEffect(() => {
    if (
      loading &&
      incomeTransactions.length === 0 &&
      expenseTransactions.length === 0
    ) {
      // Still waiting for the first data fetch
      return;
    }

    if (
      !loading &&
      incomeTransactions.length === 0 &&
      expenseTransactions.length === 0
    ) {
      setPredictionData(null);
      setLoading(false);
      return;
    }

    const riskLevel = calculateRiskLevel(
      incomeTransactions,
      expenseTransactions
    );
    const processedData = {
      incomeExpenseChart: generateHistoricalChartData(
        incomeTransactions,
        expenseTransactions
      ),
      riskLevel: riskLevel,
      upcomingChallenges: findUpcomingChallenges(expenseTransactions, language),
    };

    setPredictionData(processedData);
    const confidence = Math.min(
      95,
      70 + (incomeTransactions.length + expenseTransactions.length)
    );
    setConfidenceLevel(Math.floor(confidence));
    setLoading(false);
  }, [incomeTransactions, expenseTransactions, language]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "FIL" : "EN");
  };

  const handleViewDetails = () => {
    navigation.navigate("DetailedAnalysisScreen", {
      incomeTransactions,
      expenseTransactions,
      language,
    });
  };

  const handleCreatePlan = () => {
    Alert.alert(
      language === "EN" ? "Create Action Plan" : "Gumawa ng Action Plan",
      language === "EN"
        ? "AI will help you create a personalized financial plan based on these predictions."
        : "Tutulungan kayo ng AI na gumawa ng personalized financial plan base sa mga predictions na ito."
    );
  };

  const currentTexts = texts[language];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2c3e50"
        />
        <Text style={styles.loadingText}>
          🧠 AI is analyzing your financial data...
        </Text>
      </View>
    );
  }

  if (!predictionData) {
    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <Text style={styles.headerText}>{currentTexts.title}</Text>
          <TouchableOpacity
            onPress={toggleLanguage}
            style={styles.languageToggle}
          >
            <Text style={styles.languageText}>{language}/FIL</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            📊 No financial data to analyze.
          </Text>
        </View>
        <BottomNav />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <View style={styles.screenHeader}>
        <Text style={styles.headerText}>{currentTexts.title}</Text>
        <TouchableOpacity
          onPress={toggleLanguage}
          style={styles.languageToggle}
        >
          <Text style={styles.languageText}>{language}/FIL</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.screenContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            title={currentTexts.refreshing}
          />
        }
      >
        {/* Main Prediction Card */}
        <MainPredictionCard
          predictionData={predictionData}
          confidenceLevel={confidenceLevel}
          texts={currentTexts}
        />

        {/* Risk Level Indicator */}
        <RiskLevelIndicator
          riskLevel={predictionData.riskLevel}
          texts={currentTexts}
        />

        {/* Upcoming Challenges */}
        <UpcomingChallengesCard
          challenges={predictionData.upcomingChallenges}
          texts={currentTexts}
        />

        {/* AI Recommendations */}
        <AiRecommendationCard
          recommendations={aiRecommendations}
          texts={currentTexts}
        />

        {/* Action Buttons */}
        <ActionButtons
          onViewDetails={handleViewDetails}
          onCreatePlan={handleCreatePlan}
          texts={currentTexts}
        />
      </ScrollView>

      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 40,
    paddingHorizontal: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 12,
    color: "#888",
  },
  screenHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  languageToggle: {
    padding: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 15,
  },
  languageText: {
    fontSize: 12,
    color: "#495057",
    fontWeight: "bold",
  },
  screenContent: {
    paddingBottom: 100,
  },
});

export default PredictionScreen;
