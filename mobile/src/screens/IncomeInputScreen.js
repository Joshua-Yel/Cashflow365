import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from "react-native";
import BottomNav from "../navigation/BottomNav";
import IncomeHeader from "../components/income/IncomeHeader";
import AmountInput from "../components/income/AmountInput";
import CategorySelector from "../components/income/CategorySelector";
import RecurringSection from "../components/income/RecurringSection";
import DescriptionInput from "../components/income/DescriptionInput";
import AIInsights from "../components/income/AIInsights";
import { auth, db } from "../firebaseConfig";
import { ref, push, serverTimestamp } from "firebase/database";

const IncomeInputScreen = ({ navigation }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("EN");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [predictedImpact, setPredictedImpact] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);

  const texts = {
    EN: {
      title: "Add Income",
      amount: "Amount",
      category: "Category",
      description: "Description (Optional)",
      recurring: "Recurring Income?",
      frequency: "Frequency",
      saveIncome: "Save Income",
      quickInput: "Quick Input Options",
      aiInsights: "AI Financial Insights",
      predictedImpact: "Predicted Impact",
      suggestions: "Smart Suggestions",
      balanceIncrease: "Balance Increase",
      savingsBoost: "Savings Goal Boost",
      daysToNextGoal: "Days to Next Goal",
      frequencies: {
        daily: "Daily",
        weekly: "Weekly",
        monthly: "Monthly",
        yearly: "Yearly",
      },
    },
    FIL: {
      title: "Magdagdag ng Kita",
      amount: "Halaga",
      category: "Kategorya",
      description: "Deskripsyon (Optional)",
      recurring: "Paulit-ulit na Kita?",
      frequency: "Gaano kadalas",
      saveIncome: "I-save ang Kita",
      quickInput: "Mabilis na Paglagay",
      aiInsights: "AI Financial Insights",
      predictedImpact: "Predicted Impact",
      suggestions: "Mga Mungkahi",
      balanceIncrease: "Pagtaas ng Balanse",
      savingsBoost: "Tulak sa Ipon Goal",
      daysToNextGoal: "Araw sa Susunod na Goal",
      frequencies: {
        daily: "Araw-araw",
        weekly: "Linggo-linggo",
        monthly: "Buwan-buwan",
        yearly: "Taun-taon",
      },
    },
  };

  const currentTexts = texts[language];

  const categories = [
    { id: "salary", label: language === "EN" ? "💵 Salary" : "💵 Sahod" },
    {
      id: "side_hustle",
      label: language === "EN" ? "💼 Side Hustle" : "💼 Raket",
    },
    { id: "gifts", label: language === "EN" ? "🎁 Gifts" : "🎁 Regalo" },
    {
      id: "investment",
      label: language === "EN" ? "📈 Investment" : "📈 Pamumuhunan",
    },
    { id: "other", label: language === "EN" ? "📎 Other" : "📎 Iba pa" },
  ];

  // AI-powered income analysis
  useEffect(() => {
    if (amount && category) {
      analyzeIncomeWithAI();
    } else {
      setShowAIInsights(false);
      setPredictedImpact(null);
      setAiSuggestions([]);
      fadeAnim.setValue(0);
    }
  }, [amount, category, language]);

  const analyzeIncomeWithAI = () => {
    const incomeAmount = parseFloat(amount);
    if (!incomeAmount) return;

    const selectedCategory = categories.find((cat) => cat.id === category);
    if (!selectedCategory) return;

    // Simulate AI analysis
    setTimeout(() => {
      // Mock data for savings goal
      const savingsGoal = 5000;
      const currentSavings = 1500;
      const dailySavingsRate = 50;

      const newSavings = currentSavings + incomeAmount * 0.2; // Assume 20% is saved
      const daysToGoalBefore =
        (savingsGoal - currentSavings) / dailySavingsRate;
      const daysToGoalAfter = (savingsGoal - newSavings) / dailySavingsRate;

      setPredictedImpact({
        balanceIncrease: incomeAmount,
        savingsBoost: ((incomeAmount * 0.2) / savingsGoal) * 100,
        daysToNextGoal: Math.round(daysToGoalBefore - daysToGoalAfter),
      });

      // Generate AI suggestions
      const suggestions = generateAISuggestions(incomeAmount, selectedCategory);
      setAiSuggestions(suggestions);

      setShowAIInsights(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, 1000);
  };

  const generateAISuggestions = (incomeAmount, selectedCategory) => {
    const suggestions = [];

    if (selectedCategory.id === "salary") {
      suggestions.push({
        type: "tip",
        text:
          language === "EN"
            ? `Consider allocating ₱${(incomeAmount * 0.2).toFixed(
                0
              )} (20%) to your emergency fund.`
            : `Isaalang-alang na ilaan ang ₱${(incomeAmount * 0.2).toFixed(
                0
              )} (20%) sa iyong emergency fund.`,
      });
    }

    if (selectedCategory.id === "side_hustle" && incomeAmount > 1000) {
      suggestions.push({
        type: "insight",
        text:
          language === "EN"
            ? "This side hustle is performing well. Have you thought about reinvesting a portion to grow it?"
            : "Maganda ang kita ng raket na ito. Naisip mo na bang i-reinvest ang isang bahagi para palaguin ito?",
      });
    }

    if (selectedCategory.id === "gifts") {
      suggestions.push({
        type: "tip",
        text:
          language === "EN"
            ? "A surprise gift! This could be a great opportunity to pay off a small debt or treat yourself."
            : "Isang sorpresang regalo! Magandang pagkakataon ito para magbayad ng maliit na utang o i-treat ang sarili.",
      });
    }

    if (incomeAmount > 5000) {
      suggestions.push({
        type: "insight",
        text:
          language === "EN"
            ? "This is a significant amount. Review your financial goals to see where this can make the most impact."
            : "Malaking halaga ito. Suriin ang iyong mga financial goals para makita kung saan ito magkakaroon ng pinakamalaking epekto.",
      });
    }

    return suggestions;
  };

  const handleSaveIncome = async () => {
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
        "You must be logged in to save income."
      );
      return;
    }

    setLoading(true);

    const incomeData = {
      amount: parseFloat(amount),
      category,
      description,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : null,
      createdAt: serverTimestamp(),
    };

    try {
      const incomeRef = ref(db, `users/${user.uid}/income`);
      await push(incomeRef, incomeData);

      Alert.alert(
        "Success",
        language === "EN" ? "Income saved!" : "Na-save ang kita!"
      );

      // Reset form
      setAmount("");
      setCategory("");
      setDescription("");
      setIsRecurring(false);
      setShowAIInsights(false);
      setPredictedImpact(null);
      setAiSuggestions([]);
      fadeAnim.setValue(0);
    } catch (error) {
      console.error("Firebase Write Error:", error);
      Alert.alert(
        "Error",
        "There was an issue saving your income. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "FIL" : "EN");
  };

  return (
    <View style={styles.container}>
      <IncomeHeader
        navigation={navigation}
        title={currentTexts.title}
        language={language}
        onToggleLanguage={toggleLanguage}
      />

      <ScrollView contentContainerStyle={styles.screenContent}>
        <AmountInput
          label={currentTexts.amount}
          amount={amount}
          onSetAmount={setAmount}
        />

        <CategorySelector
          label={currentTexts.category}
          categories={categories}
          selectedCategory={category}
          onSetCategory={setCategory}
        />

        <RecurringSection
          texts={currentTexts}
          isRecurring={isRecurring}
          onSetIsRecurring={setIsRecurring}
          recurringFrequency={recurringFrequency}
          onSetRecurringFrequency={setRecurringFrequency}
        />

        <DescriptionInput
          label={currentTexts.description}
          description={description}
          onSetDescription={setDescription}
          placeholder={
            language === "EN" ? "e.g., July Salary" : "e.g., Sahod sa Hulyo"
          }
        />

        <AIInsights
          visible={showAIInsights}
          fadeAnim={fadeAnim}
          texts={currentTexts}
          predictedImpact={predictedImpact}
          aiSuggestions={aiSuggestions}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveIncome}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>{currentTexts.saveIncome}</Text>
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
  screenContent: {
    paddingBottom: 100,
  },
  saveButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
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

export default IncomeInputScreen;
