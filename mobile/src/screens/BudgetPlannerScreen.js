import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";
import useBudgetPlannerAI from "../hooks/useBudgetPlannerAI";

const BudgetPlannerScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [language, setLanguage] = useState("EN");

  const texts = {
    EN: {
      title: "AI Budget Planner",
      noProfile: "Please set up your profile first to get a budget plan.",
      noIncome: "Add your monthly income in your profile to generate a budget.",
      planTitle: "Your 50/30/20 Budget Plan",
      totalIncome: "Based on your monthly income of",
      needs: "Needs (50%)",
      wants: "Wants (30%)",
      savings: "Savings (20%)",
      allocated: "Allocated",
      spent: "Spent",
      saved: "Saved",
      aiTips: "AI-Powered Tips",
      savePlan: "Activate This Plan",
    },
    FIL: {
      title: "AI Budget Planner",
      noProfile:
        "Paki-setup muna ang iyong profile para makakuha ng budget plan.",
      noIncome:
        "Ilagay ang iyong buwanang kita sa profile para makabuo ng budget.",
      planTitle: "Ang Iyong 50/30/20 Budget Plan",
      totalIncome: "Base sa iyong buwanang kita na",
      needs: "Pangangailangan (50%)",
      wants: "Kagustuhan (30%)",
      savings: "Ipon (20%)",
      allocated: "Nilaan",
      spent: "Nagastos",
      saved: "Naipon",
      aiTips: "Mga Tip mula sa AI",
      savePlan: "I-activate ang Plano",
    },
  };

  const currentTexts = texts[language];

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const profileRef = ref(db, `users/${user.uid}/profile`);
    const expensesRef = ref(db, `users/${user.uid}/expenses`);

    const profileUnsubscribe = onValue(profileRef, (snapshot) => {
      const data = snapshot.val();
      setProfile(data);
      if (data?.language) {
        setLanguage(data.language);
      }
    });

    const expensesUnsubscribe = onValue(expensesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setExpenses(Object.values(data));
    });

    return () => {
      profileUnsubscribe();
      expensesUnsubscribe();
    };
  }, []);

  // --- AI-Powered Budget Planner Hook ---
  const {
    isLoading: isAiLoading,
    budgetPlan,
    aiTips,
  } = useBudgetPlannerAI(profile, expenses, language);

  useEffect(() => {
    if (profile !== null && !isAiLoading) {
      setLoading(false);
    }
  }, [profile, isAiLoading]);

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

  const handleSavePlan = () => {
    Alert.alert(
      currentTexts.savePlan,
      language === "EN"
        ? "This feature will help you track your spending against this new budget. Coming soon!"
        : "Tutulungan ka ng feature na ito na i-track ang iyong gastos laban sa bagong budget. Malapit na!"
    );
  };

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

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text>{currentTexts.noProfile}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("SetupProfileScreen")}
        >
          <Text style={styles.linkText}>Go to Profile Setup</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!budgetPlan) {
    return (
      <View style={styles.centered}>
        <Text>{currentTexts.noIncome}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("SetupProfileScreen")}
        >
          <Text style={styles.linkText}>Update Profile</Text>
        </TouchableOpacity>
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
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>{currentTexts.planTitle}</Text>
          <Text style={styles.incomeText}>
            {currentTexts.totalIncome} ₱{profile.monthlyIncome.toLocaleString()}
          </Text>

          {/* Needs */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{currentTexts.needs}</Text>
            <ProgressBar
              percentage={budgetPlan.needs.percentage}
              color="#ff6b6b"
            />
            <View style={styles.amountRow}>
              <Text style={styles.amountText}>
                {currentTexts.spent}: ₱{budgetPlan.needs.spent.toLocaleString()}
              </Text>
              <Text style={styles.amountText}>
                {currentTexts.allocated}: ₱
                {budgetPlan.needs.allocated.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Wants */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{currentTexts.wants}</Text>
            <ProgressBar
              percentage={budgetPlan.wants.percentage}
              color="#feca57"
            />
            <View style={styles.amountRow}>
              <Text style={styles.amountText}>
                {currentTexts.spent}: ₱{budgetPlan.wants.spent.toLocaleString()}
              </Text>
              <Text style={styles.amountText}>
                {currentTexts.allocated}: ₱
                {budgetPlan.wants.allocated.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Savings */}
          <View style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{currentTexts.savings}</Text>
            <ProgressBar
              percentage={budgetPlan.savings.percentage}
              color="#4ecdc4"
            />
            <View style={styles.amountRow}>
              <Text style={styles.amountText}>
                {currentTexts.saved}: ₱
                {budgetPlan.savings.actual.toLocaleString()}
              </Text>
              <Text style={styles.amountText}>
                Target: ₱{budgetPlan.savings.allocated.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* AI-Powered Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>{currentTexts.aiTips}</Text>
          {aiTips.map((tip, index) => (
            <View
              key={index}
              style={styles.tipItem}
            >
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePlan}
        >
          <Text style={styles.saveButtonText}>{currentTexts.savePlan}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    textAlign: "center",
  },
  linkText: {
    marginTop: 15,
    color: "#667eea",
    fontWeight: "bold",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginRight: 40, // to balance the back button
  },
  content: {
    padding: 20,
  },
  planCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  incomeText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34495e",
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: "#ecf0f1",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 5,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  amountText: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  tipsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#34495e",
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BudgetPlannerScreen;
