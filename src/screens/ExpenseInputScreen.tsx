import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, push, serverTimestamp, onValue } from "firebase/database";
import { auth, db } from "../firebaseConfig";
import BottomNav from "../navigation/BottomNav";
import useExpenseAI from "../hooks/useExpenseAI";

interface Category {
  id: string;
  budget: number;
  spent: number;
  label: string;
}

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

const categoryLabels: Record<string, Record<string, string>> = {
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

const baseCategories = [
  { id: "food", budget: 5000, icon: "🍽️" },
  { id: "transport", budget: 2000, icon: "🚌" },
  { id: "bills", budget: 3500, icon: "💡" },
  { id: "medicine", budget: 1500, icon: "🏥" },
  { id: "education", budget: 2500, icon: "📚" },
  { id: "emergency", budget: 1000, icon: "🚨" },
];

const ExpenseInputScreen: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("EN");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const expensesRef = ref(db, `users/${user.uid}/expenses`);
    const unsubscribe = onValue(expensesRef, (snapshot) => {
      const expensesData = snapshot.val() || {};
      const expensesList = Object.values(expensesData);

      const spentByCategory = expensesList.reduce((acc: Record<string, number>, expense: any) => {
        if (expense.category) {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        }
        return acc;
      }, {} as Record<string, number>);

      const updatedCategories = baseCategories.map((cat) => ({
        ...cat,
        spent: spentByCategory[cat.id] || 0,
        label: `${cat.icon} ${categoryLabels[language][cat.id]}`,
      }));

      setCategories(updatedCategories);
    });

    return () => unsubscribe();
  }, [language]);

  const currentTexts = texts[language as keyof typeof texts];

  // AI-Powered Expense Analysis Hook
  const {
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
      alert(
        language === "EN"
          ? "Please fill in the amount and select a category"
          : "Pakipunan ang halaga at pumili ng kategorya"
      );
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to save an expense.");
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

      alert(
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
      alert("There was an issue saving your expense. Please try again.");
    } finally {
      setIsSaving(false);
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
        {/* Budget Warning */}
        {budgetWarning && (
          <div className="alert alert-warning">
            <span>⚠️</span>
            <span>{budgetWarning.message}</span>
          </div>
        )}

        {/* Amount Input */}
        <div className="input-group">
          <label className="input-label">{currentTexts.amount}</label>
          <input
            className="input"
            placeholder="₱150"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Category Selection */}
        <div className="input-group">
          <label className="input-label">{currentTexts.category}</label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((item) => {
              const budgetUsage = (item.spent / item.budget) * 100;
              return (
                <button
                  key={item.id}
                  className={`p-4 text-center border-2 rounded-lg transition-colors ${
                    category === item.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setCategory(item.id)}
                >
                  <div className="text-lg mb-2">{item.label}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${
                        budgetUsage > 85
                          ? "bg-red-500"
                          : budgetUsage > 70
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    ₱{item.spent}/₱{item.budget}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recurring Expense Toggle */}
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
              language === "EN" ? "Breakfast at the corner" : "Almusal sa kanto"
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
                      {predictedImpact.budgetUsage.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Budget Used</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-800">
                      ₱{predictedImpact.remainingBudget}
                    </div>
                    <div className="text-sm text-gray-600">Remaining</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-800">
                      {predictedImpact.daysUntilPayday}
                    </div>
                    <div className="text-sm text-gray-600">Days to Payday</div>
                  </div>
                </div>
              </div>
            )}

            {aiSuggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  {currentTexts.suggestions}
                </h4>
                {aiSuggestions.map((suggestion, index) => {
                  if (suggestion.type === "loading") {
                    return (
                      <div key={index} className="flex items-center gap-2 p-3">
                        <div className="loading-spinner"></div>
                        <span className="text-gray-600">{suggestion.text}</span>
                      </div>
                    );
                  }
                  return (
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
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Save Expense Button */}
        <button
          className="btn btn-success w-full"
          onClick={handleSaveExpense}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="loading-spinner"></div>
              Saving...
            </>
          ) : (
            currentTexts.saveExpense
          )}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ExpenseInputScreen;
