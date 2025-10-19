import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ref, push, serverTimestamp } from "firebase/database";
import { auth, db } from "../firebaseConfig";
import BottomNav from "../navigation/BottomNav";

interface Category {
  id: string;
  label: string;
}

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

const IncomeInputScreen: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("EN");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [predictedImpact, setPredictedImpact] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const currentTexts = texts[language as keyof typeof texts];

  const categories: Category[] = [
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

  const analyzeIncomeWithAI = useCallback(() => {
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
    }, 1000);
  }, [amount, category, categories, language]);

  // AI-powered income analysis
  useEffect(() => {
    if (amount && category) {
      analyzeIncomeWithAI();
    } else {
      setShowAIInsights(false);
      setPredictedImpact(null);
      setAiSuggestions([]);
    }
  }, [amount, category, language, analyzeIncomeWithAI]);

  const generateAISuggestions = (incomeAmount: number, selectedCategory: Category) => {
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
      alert(
        language === "EN"
          ? "Please fill in the amount and select a category"
          : "Pakipunan ang halaga at pumili ng kategorya"
      );
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to save income.");
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

      alert(
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
    } catch (error) {
      console.error("Firebase Write Error:", error);
      alert("There was an issue saving your income. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "FIL" : "EN");
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Screen Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl text-gray-600 hover:text-gray-800"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-800">{currentTexts.title}</h1>
        <button
          onClick={toggleLanguage}
          className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold"
        >
          {language}
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Amount Input */}
        <div className="input-group">
          <label className="input-label">{currentTexts.amount}</label>
          <input
            className="input"
            placeholder="₱5000"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Category Selection */}
        <div className="input-group">
          <label className="input-label">{currentTexts.category}</label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((item) => (
              <button
                key={item.id}
                className={`p-4 text-center border-2 rounded-lg transition-colors ${
                  category === item.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setCategory(item.id)}
              >
                <div className="text-lg">{item.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recurring Income Toggle */}
        <div className="input-group">
          <div className="flex justify-between items-center">
            <label className="input-label">{currentTexts.recurring}</label>
            <button
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                isRecurring
                  ? "border-green-500 bg-green-500"
                  : "border-gray-300"
              }`}
              onClick={() => setIsRecurring(!isRecurring)}
            >
              {isRecurring && <span className="text-white text-sm">✓</span>}
            </button>
          </div>

          {isRecurring && (
            <div className="mt-4">
              <label className="input-label">{currentTexts.frequency}</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(currentTexts.frequencies).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      className={`px-4 py-2 rounded-full border ${
                        recurringFrequency === key
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onClick={() => setRecurringFrequency(key)}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Description Input */}
        <div className="input-group">
          <label className="input-label">{currentTexts.description}</label>
          <input
            className="input"
            placeholder={
              language === "EN" ? "e.g., July Salary" : "e.g., Sahod sa Hulyo"
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* AI Insights Card */}
        {showAIInsights && (
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-4">
              🧠 {currentTexts.aiInsights}
            </h3>

            {predictedImpact && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  {currentTexts.predictedImpact}
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-gray-800">
                      ₱{predictedImpact.balanceIncrease}
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentTexts.balanceIncrease}
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-800">
                      {predictedImpact.savingsBoost.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentTexts.savingsBoost}
                    </div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-800">
                      {predictedImpact.daysToNextGoal}
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentTexts.daysToNextGoal}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {aiSuggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  {currentTexts.suggestions}
                </h4>
                {aiSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg mb-2 ${
                      suggestion.type === "warning"
                        ? "bg-red-100 border-l-4 border-red-500"
                        : suggestion.type === "tip"
                        ? "bg-green-100 border-l-4 border-green-500"
                        : "bg-blue-100 border-l-4 border-blue-500"
                    }`}
                  >
                    <p className="text-gray-800">{suggestion.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save Income Button */}
        <button
          className="btn btn-success w-full"
          onClick={handleSaveIncome}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="loading-spinner"></div>
              Saving...
            </>
          ) : (
            currentTexts.saveIncome
          )}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default IncomeInputScreen;