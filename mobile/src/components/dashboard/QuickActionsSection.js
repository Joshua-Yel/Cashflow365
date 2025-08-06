import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import styles from "../../quick-actions.styles.js";

// Centralized translations
const translations = {
  quickActions: { EN: "Quick Actions", FIL: "Mabilisang Aksyon" },
  addIncome: { EN: "Add Income", FIL: "Dagdag Kita" },
  logExpense: { EN: "Log Expense", FIL: "I-log ang Gastos" },
  budgetPlanner: { EN: "Budget Planner", FIL: "Budget Planner" },
  savingsGoals: { EN: "Savings Goals", FIL: "Savings Goals" },
};

// Reusable QuickAction button component
const QuickAction = ({ icon, text, onPress, testID }) => (
  <TouchableOpacity
    style={styles.quickActionCard}
    onPress={onPress}
    testID={testID}
  >
    <Text style={styles.quickActionIcon}>{icon}</Text>
    <Text style={styles.quickActionText}>{text}</Text>
  </TouchableOpacity>
);

QuickAction.propTypes = {
  icon: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  testID: PropTypes.string,
};

const QuickActionsSection = ({ language, navigation }) => {
  const t = (key) => translations[key][language];

  const actions = [
    {
      icon: "💰",
      text: t("addIncome"),
      screen: "IncomeInputScreen",
      testID: "add-income-button",
    },
    {
      icon: "📝",
      text: t("logExpense"),
      screen: "ExpensesListScreen",
      testID: "log-expense-button",
    },
    {
      icon: "🎯",
      text: t("budgetPlanner"),
      screen: "BudgetPlannerScreen",
      testID: "budget-planner-button",
      options: {
        headerShown: false,
        gestureEnabled: false,
        animation: "fade_from_bottom",
        gestureDirection: "none",
        cardStyleInterpolator: ({ current: { progress } }) => {
          return {
            cardStyle: {
              opacity: progress,
            },
          };
        },
      },
    },
    {
      icon: "🏦",
      text: t("savingsGoals"),
      screen: "SavingsGoalsScreen",
      testID: "savings-goals-button",
    },
  ];

  return (
    <View style={styles.quickActionsSection}>
      <Text style={styles.sectionTitle}>⚡ {t("quickActions")}</Text>
      <View style={styles.quickActionsGrid}>
        {actions.map((action) => (
          <QuickAction
            key={action.screen}
            icon={action.icon}
            text={action.text}
            onPress={() => navigation.navigate(action.screen)}
            testID={action.testID}
          />
        ))}
      </View>
    </View>
  );
};

QuickActionsSection.propTypes = {
  language: PropTypes.oneOf(["EN", "FIL"]).isRequired,
  navigation: PropTypes.object.isRequired,
};

export default QuickActionsSection;
