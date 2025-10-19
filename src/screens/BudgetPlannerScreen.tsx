import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, set } from "firebase/database";
import { auth, db } from "../firebaseConfig";
import BottomNav from "../navigation/BottomNav";

interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  budgetPercentage: number;
  spent: number;
  color: string;
}

interface ExpenseTransaction {
  amount: number;
  category: string;
  date: string;
  [key: string]: any;
}

const texts = {
  EN: {
    title: "Budget Planner",
    monthlyIncome: "Monthly Income",
    totalBudget: "Total Budget",
    totalSpent: "Total Spent",
    remaining: "Remaining",
    budgetAllocation: "Budget Allocation",
    actualSpending: "Actual Spending",
    setPercentage: "Set %",
    resetToRecommended: "Reset to Recommended",
    saveBudget: "Save Budget",
    aiInsights: "AI Insights",
    overBudget: "Over Budget",
    nearLimit: "Near Limit",
    onTrack: "On Track",
    notSet: "Income Not Set",
    goToProfile: "Set your monthly income in Profile",
  },
  FIL: {
    title: "Budget Planner",
    monthlyIncome: "Buwanang Kita",
    totalBudget: "Kabuuang Budget",
    totalSpent: "Kabuuang Ginastos",
    remaining: "Natitira",
    budgetAllocation: "Pamamahagi ng Budget",
    actualSpending: "Aktwal na Gastos",
    setPercentage: "Itakda %",
    resetToRecommended: "I-reset sa Inirerekomenda",
    saveBudget: "I-save ang Budget",
    aiInsights: "AI Insights",
    overBudget: "Lumalampas sa Budget",
    nearLimit: "Malapit na sa Limit",
    onTrack: "Nasa Tamang Landas",
    notSet: "Walang Kita",
    goToProfile: "Itakda ang inyong buwanang kita sa Profile",
  },
};

// Recommended budget allocation (50/30/20 rule adapted for Filipino context)
const recommendedBudgets: BudgetCategory[] = [
  { id: "food", name: "Food & Groceries", icon: "🍽️", budgetPercentage: 30, spent: 0, color: "#FF6B6B" },
  { id: "transport", name: "Transportation", icon: "🚗", budgetPercentage: 10, spent: 0, color: "#4ECDC4" },
  { id: "bills", name: "Bills & Utilities", icon: "💡", budgetPercentage: 15, spent: 0, color: "#45B7D1" },
  { id: "health", name: "Health & Medicine", icon: "⚕️", budgetPercentage: 5, spent: 0, color: "#96CEB4" },
  { id: "education", name: "Education", icon: "📚", budgetPercentage: 5, spent: 0, color: "#FFEAA7" },
  { id: "entertainment", name: "Entertainment", icon: "🎮", budgetPercentage: 5, spent: 0, color: "#DDA0DD" },
  { id: "shopping", name: "Shopping", icon: "🛍️", budgetPercentage: 10, spent: 0, color: "#FFB6C1" },
  { id: "savings", name: "Savings", icon: "💰", budgetPercentage: 15, spent: 0, color: "#98D8C8" },
  { id: "other", name: "Others", icon: "📦", budgetPercentage: 5, spent: 0, color: "#D3D3D3" },
];

const BudgetPlannerScreen: React.FC = () => {
  const [language, setLanguage] = useState("EN");
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [categories, setCategories] = useState<BudgetCategory[]>(recommendedBudgets);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const navigate = useNavigate();

  const currentTexts = texts[language as keyof typeof texts];

  // Load user's monthly income from profile
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const profileRef = ref(db, `users/${user.uid}/profile`);
    const unsubscribe = onValue(profileRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMonthlyIncome(data.monthlyIncome || 0);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user's budget allocation
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const budgetRef = ref(db, `users/${user.uid}/budget`);
    const unsubscribe = onValue(budgetRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.categories) {
        setCategories(data.categories);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load actual spending from expenses
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const expensesRef = ref(db, `users/${user.uid}/expenses`);
    const unsubscribe = onValue(expensesRef, (snapshot) => {
      const expensesData = snapshot.val() || {};
      const expensesList: ExpenseTransaction[] = Object.values(expensesData);

      // Get current month's expenses only
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const currentMonthExpenses = expensesList.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      });

      // Calculate spending by category
      const spentByCategory: Record<string, number> = {};
      currentMonthExpenses.forEach((expense) => {
        const category = expense.category || "other";
        spentByCategory[category] = (spentByCategory[category] || 0) + expense.amount;
      });

      // Update categories with actual spending
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          spent: spentByCategory[cat.id] || 0,
        }))
      );
    });

    return () => unsubscribe();
  }, []);

  // Calculate totals
  const totalBudgetAmount = categories.reduce(
    (sum, cat) => sum + (monthlyIncome * cat.budgetPercentage) / 100,
    0
  );
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudgetAmount - totalSpent;
  const totalPercentage = categories.reduce((sum, cat) => sum + cat.budgetPercentage, 0);

  // Generate AI insights
  useEffect(() => {
    if (!monthlyIncome) return;

    const newInsights: string[] = [];

    // Check if total percentage is not 100%
    if (totalPercentage !== 100) {
      newInsights.push(
        language === "EN"
          ? `⚠️ Your budget allocation is ${totalPercentage}%. Adjust to reach 100%.`
          : `⚠️ Ang inyong budget allocation ay ${totalPercentage}%. I-adjust upang maabot ang 100%.`
      );
    }

    // Check for overspending categories
    const overspentCategories = categories.filter((cat) => {
      const budget = (monthlyIncome * cat.budgetPercentage) / 100;
      return cat.spent > budget;
    });

    if (overspentCategories.length > 0) {
      const categoryNames = overspentCategories.map((c) => c.name).join(", ");
      newInsights.push(
        language === "EN"
          ? `🚨 Over budget in: ${categoryNames}`
          : `🚨 Lumalampas sa budget sa: ${categoryNames}`
      );
    }

    // Check savings rate
    const savingsCategory = categories.find((c) => c.id === "savings");
    if (savingsCategory && savingsCategory.budgetPercentage < 15) {
      newInsights.push(
        language === "EN"
          ? "💡 Consider allocating at least 15% to savings for financial security."
          : "💡 Isaalang-alang na maglaan ng hindi bababa sa 15% para sa savings."
      );
    }

    // Check if spending is healthy
    if (totalSpent > monthlyIncome * 0.9) {
      newInsights.push(
        language === "EN"
          ? "⚠️ You've spent over 90% of your income. Review your expenses."
          : "⚠️ Nakagastos na kayo ng mahigit 90% ng inyong kita. Suriin ang gastos."
      );
    } else if (totalSpent < monthlyIncome * 0.5) {
      newInsights.push(
        language === "EN"
          ? "✅ Great job! You're living well below your means."
          : "✅ Magaling! Nabubuhay kayo nang mas mababa sa inyong kita."
      );
    }

    if (newInsights.length === 0) {
      newInsights.push(
        language === "EN"
          ? "✅ Your budget is well-balanced. Keep it up!"
          : "✅ Ang inyong budget ay balanse. Ipagpatuloy!"
      );
    }

    setInsights(newInsights);
  }, [categories, monthlyIncome, totalPercentage, totalSpent, language]);

  const handlePercentageChange = (categoryId: string, newPercentage: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, budgetPercentage: Math.max(0, Math.min(100, newPercentage)) } : cat
      )
    );
  };

  const handleResetToRecommended = () => {
    setCategories(recommendedBudgets.map((cat) => ({ ...cat, spent: categories.find((c) => c.id === cat.id)?.spent || 0 })));
  };

  const handleSaveBudget = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (totalPercentage !== 100) {
      alert(
        language === "EN"
          ? "Budget allocation must total 100%. Currently: " + totalPercentage + "%"
          : "Ang kabuuan ng budget ay dapat 100%. Kasalukuyan: " + totalPercentage + "%"
      );
      return;
    }

    setLoading(true);
    try {
      const budgetRef = ref(db, `users/${user.uid}/budget`);
      await set(budgetRef, {
        categories,
        lastUpdated: new Date().toISOString(),
      });

      alert(language === "EN" ? "✓ Budget saved successfully!" : "✓ Na-save ang budget!");
    } catch (error) {
      console.error("Error saving budget:", error);
      alert(language === "EN" ? "Error saving budget" : "Hindi ma-save ang budget");
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "FIL" : "EN");
  };

  if (!monthlyIncome) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <button onClick={() => navigate(-1)} className="text-2xl text-gray-600">←</button>
          <h1 className="text-lg font-bold text-gray-800">{currentTexts.title}</h1>
          <button onClick={toggleLanguage} className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold">
            {language}
          </button>
        </div>

        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{currentTexts.notSet}</h2>
          <p className="text-gray-600 text-center mb-6">{currentTexts.goToProfile}</p>
          <button
            onClick={() => navigate("/profile")}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600"
          >
            {language === "EN" ? "Go to Profile" : "Pumunta sa Profile"}
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-2xl text-gray-600">←</button>
        <h1 className="text-lg font-bold text-gray-800">{currentTexts.title}</h1>
        <button onClick={toggleLanguage} className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold">
          {language}
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <div className="text-xs text-gray-500 mb-1">{currentTexts.monthlyIncome}</div>
            <div className="text-lg font-bold text-blue-600">₱{monthlyIncome.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <div className="text-xs text-gray-500 mb-1">{currentTexts.totalSpent}</div>
            <div className="text-lg font-bold text-red-600">₱{Math.round(totalSpent).toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <div className="text-xs text-gray-500 mb-1">{currentTexts.remaining}</div>
            <div className={`text-lg font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₱{Math.round(remaining).toLocaleString()}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <h3 className="text-sm font-bold text-blue-800 mb-2">🤖 {currentTexts.aiInsights}</h3>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div key={index} className="text-sm text-gray-700 bg-white rounded-lg p-2">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Allocation */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">{currentTexts.budgetAllocation}</h2>
            <div className={`text-sm font-bold ${totalPercentage === 100 ? "text-green-600" : "text-red-600"}`}>
              {totalPercentage}%
            </div>
          </div>

          <div className="space-y-3">
            {categories.map((category) => {
              const budgetAmount = (monthlyIncome * category.budgetPercentage) / 100;
              const percentage = budgetAmount > 0 ? (category.spent / budgetAmount) * 100 : 0;
              const isOver = category.spent > budgetAmount;
              const isNear = percentage > 80 && !isOver;

              return (
                <div key={category.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{category.icon}</span>
                      <div>
                        <div className="font-semibold text-sm">{category.name}</div>
                        <div className="text-xs text-gray-500">
                          ₱{Math.round(category.spent).toLocaleString()} / ₱{Math.round(budgetAmount).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingCategory(editingCategory === category.id ? null : category.id)}
                      className="text-blue-500 text-xs font-semibold hover:text-blue-700"
                    >
                      {editingCategory === category.id ? "✓" : currentTexts.setPercentage}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: isOver ? "#EF4444" : isNear ? "#F59E0B" : category.color,
                      }}
                    />
                  </div>

                  {/* Edit Percentage */}
                  {editingCategory === category.id && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={category.budgetPercentage}
                        onChange={(e) => handlePercentageChange(category.id, parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={category.budgetPercentage}
                        onChange={(e) => handlePercentageChange(category.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border rounded text-center text-sm"
                      />
                      <span className="text-sm font-semibold">%</span>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between text-xs mt-2">
                    <span className="text-gray-500">{category.budgetPercentage}% of income</span>
                    <span
                      className={`font-semibold ${
                        isOver ? "text-red-600" : isNear ? "text-yellow-600" : "text-green-600"
                      }`}
                    >
                      {isOver ? currentTexts.overBudget : isNear ? currentTexts.nearLimit : currentTexts.onTrack}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleResetToRecommended}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            {currentTexts.resetToRecommended}
          </button>
          <button
            onClick={handleSaveBudget}
            disabled={loading || totalPercentage !== 100}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "⏳ Saving..." : currentTexts.saveBudget}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default BudgetPlannerScreen;