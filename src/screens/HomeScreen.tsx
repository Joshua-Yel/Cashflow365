import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { auth, db } from "../firebaseConfig";
import BottomNav from "../navigation/BottomNav";
import FinancialHealthScore from "../components/dashboard/FinancialHealthScore";
import useDashboardAI from "../hooks/useDashboardAI";

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  solution: string;
  seen: boolean;
}

interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  description?: string;
}

const HomeScreen: React.FC = () => {
  const [language, setLanguage] = useState("EN");
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [initialBalance, setInitialBalance] = useState(0);
  const [incomeTransactions, setIncomeTransactions] = useState<any[]>([]);
  const [expenseTransactions, setExpenseTransactions] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [predictedShortfall, setPredictedShortfall] = useState(0);
  const [displayAlerts, setDisplayAlerts] = useState<Alert[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  // Category icons mapping
  const categoryIcons: Record<string, string> = {
    food: "🍔",
    transport: "🚗",
    shopping: "🛍️",
    bills: "📄",
    health: "⚕️",
    entertainment: "🎮",
    education: "📚",
    salary: "💼",
    freelance: "💻",
    business: "🏪",
    investment: "📈",
    gift: "🎁",
    other: "💳",
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const uid = user.uid;
    const subscriptions: (() => void)[] = [];

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
          const transactions = Object.entries(incomeData).map(([id, data]: [string, any]) => ({
            id,
            ...data,
            type: 'income' as const,
          }));
          setIncomeTransactions(transactions);
          const calculatedIncome = transactions.reduce(
            (sum: number, item: any) => sum + (item.amount || 0),
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
          const transactions = Object.entries(expensesData).map(([id, data]: [string, any]) => ({
            id,
            ...data,
            type: 'expense' as const,
          }));
          setExpenseTransactions(transactions);
          const calculatedExpenses = transactions.reduce(
            (sum: number, item: any) => sum + (item.amount || 0),
            0
          );
          setTotalExpenses(calculatedExpenses);

          // Calculate top spending categories
          const categorySpending: Record<string, number> = {};
          transactions.forEach((tx: any) => {
            if (tx.category) {
              categorySpending[tx.category] = (categorySpending[tx.category] || 0) + tx.amount;
            }
          });

          const sorted = Object.entries(categorySpending)
            .map(([name, amount]) => ({ name, amount, icon: categoryIcons[name] || "💳" }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);

          setTopCategories(sorted);

          // Get upcoming recurring bills
          const recurring = transactions.filter((tx: any) => tx.isRecurring);
          setUpcomingBills(recurring.slice(0, 3));
        },
        (error) => console.error("Firebase expenses read error:", error)
      )
    );

    setLoading(false);

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, [categoryIcons]);

  // Combine and sort recent transactions
  useEffect(() => {
    const combined = [...incomeTransactions, ...expenseTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    setRecentTransactions(combined);
  }, [incomeTransactions, expenseTransactions]);

  useEffect(() => {
    setCurrentBalance(initialBalance + totalIncome - totalExpenses);
  }, [initialBalance, totalIncome, totalExpenses]);

  // Calculate cash flow forecast
  useEffect(() => {
    if (loading) return;

    const calculateForecast = () => {
      const recurringIncome = incomeTransactions.filter((t) => t.isRecurring);
      const recurringExpenses = expenseTransactions.filter((t) => t.isRecurring);

      const forecast = [];
      let weekBalance = currentBalance;

      for (let i = 0; i < 4; i++) {
        let weeklyIncome = 0;
        let weeklyExpenses = 0;

        const addTransactionToTotals = (transactions: any[], isIncome: boolean) => {
          transactions.forEach((t) => {
            let weeklyAmount = 0;
            if (t.recurringFrequency === "daily") weeklyAmount = t.amount * 7;
            if (t.recurringFrequency === "weekly") weeklyAmount = t.amount;
            if (t.recurringFrequency === "monthly") weeklyAmount = t.amount / 4;
            if (t.recurringFrequency === "yearly") weeklyAmount = t.amount / 52;

            if (isIncome) weeklyIncome += weeklyAmount;
            else weeklyExpenses += weeklyAmount;
          });
        };

        addTransactionToTotals(recurringIncome, true);
        addTransactionToTotals(recurringExpenses, false);

        weekBalance += weeklyIncome - weeklyExpenses;

        forecast.push({
          period: `Week ${i + 1}`,
          income: Math.round(weeklyIncome),
          expenses: Math.round(weeklyExpenses),
          balance: Math.round(weekBalance),
        });
      }

      const lowestFutureBalance = forecast.reduce(
        (min, p) => (p.balance < min ? p.balance : min),
        Infinity
      );
      const shortfall = lowestFutureBalance < 0 ? Math.abs(lowestFutureBalance) : 0;
      setPredictedShortfall(shortfall);
    };

    calculateForecast();
  }, [currentBalance, incomeTransactions, expenseTransactions, loading]);

  // AI-Powered Dashboard Analysis
  const { alerts } = useDashboardAI(
    currentBalance,
    predictedShortfall,
    totalIncome,
    totalExpenses,
    userName,
    language,
    loading
  );

  useEffect(() => {
    if (alerts) {
      setDisplayAlerts(alerts);
    }
  }, [alerts]);

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "FIL" : "EN");
  };

  const toggleAlert = (alertId: string) => {
    setDisplayAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, seen: !alert.seen } : alert
      )
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
  const balanceChange = currentBalance - initialBalance;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-b-2xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">CASHFLOW365</h1>
          <button
            onClick={toggleLanguage}
            className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-semibold hover:bg-opacity-30 transition-colors"
          >
            {language}
          </button>
        </div>
        <p className="text-lg opacity-90">
          {language === "EN" ? `Good morning, ${userName}!` : `Magandang umaga, ${userName}!`}
        </p>
      </div>

      {/* Net Worth Card */}
      <div className="mx-4 mt-4 mb-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600">
              {language === "EN" ? "Current Balance" : "Kasalukuyang Balanse"}
            </h3>
            <span className="text-xs text-gray-400">
              {language === "EN" ? "This Month" : "Ngayong Buwan"}
            </span>
          </div>
          <div className="text-4xl font-bold text-gray-800 mb-2">
            ₱{currentBalance.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-semibold ${balanceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {balanceChange >= 0 ? '↑' : '↓'} ₱{Math.abs(balanceChange).toLocaleString()}
            </span>
            <span className="text-gray-500">
              {language === "EN" ? "vs starting balance" : "vs simula"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mx-4 mb-4 grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-4 shadow-md">
          <div className="text-sm opacity-90">
            {language === "EN" ? "Total Income" : "Kabuuang Kita"}
          </div>
          <div className="text-2xl font-bold mt-1">₱{totalIncome.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white rounded-xl p-4 shadow-md">
          <div className="text-sm opacity-90">
            {language === "EN" ? "Total Expenses" : "Kabuuang Gastos"}
          </div>
          <div className="text-2xl font-bold mt-1">₱{totalExpenses.toLocaleString()}</div>
        </div>
      </div>

      {/* Savings Rate */}
      <div className="mx-4 mb-4">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-600">
                {language === "EN" ? "Savings Rate" : "Rate ng Ipon"}
              </h3>
              <p className="text-3xl font-bold text-purple-600">{savingsRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-600 mt-1">
                {savingsRate >= 20 
                  ? (language === "EN" ? "Excellent! Keep it up!" : "Napakagaling!")
                  : (language === "EN" ? "Try to save at least 20%" : "Subukang mag-ipon ng 20%")}
              </p>
            </div>
            <div className="text-5xl">💎</div>
          </div>
        </div>
      </div>

      {/* Financial Health Score */}
      <FinancialHealthScore
        language={language}
        currentBalance={currentBalance}
        predictedShortfall={predictedShortfall}
      />

      {/* AI Insights */}
      {displayAlerts.length > 0 && (
        <div className="mx-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            {language === "EN" ? "🤖 AI Insights" : "🤖 AI Insights"}
          </h2>
          {displayAlerts.slice(0, 2).map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl p-4 mb-3 border-l-4 ${
                alert.type === 'critical' ? 'bg-red-50 border-red-500' :
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-800 font-semibold mb-1">{alert.message}</p>
                  <p className="text-sm text-gray-600">{alert.solution}</p>
                </div>
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className="ml-4 text-gray-400 hover:text-gray-600 text-xl"
                >
                  {alert.seen ? "✓" : "○"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming Bills */}
      {upcomingBills.length > 0 && (
        <div className="mx-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            {language === "EN" ? "📅 Upcoming Bills" : "📅 Paparating na Bills"}
          </h2>
          <div className="space-y-2">
            {upcomingBills.map((bill) => (
              <div key={bill.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categoryIcons[bill.category] || "💳"}</span>
                  <div>
                    <p className="font-semibold text-sm capitalize">{bill.category}</p>
                    <p className="text-xs text-gray-500">
                      {bill.recurringFrequency} • {bill.description || 'Recurring'}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-800">₱{bill.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Spending */}
      {topCategories.length > 0 && (
        <div className="mx-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            {language === "EN" ? "📊 Top Spending" : "📊 Pangunahing Gastos"}
          </h2>
          <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
            {topCategories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-semibold capitalize">{cat.name}</span>
                    <span className="text-sm font-bold">₱{cat.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div className="mx-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">
              {language === "EN" ? "💳 Recent" : "💳 Kamakailang"}
            </h2>
            <button 
              onClick={() => navigate("/transactions")}
              className="text-sm text-blue-500 font-semibold hover:text-blue-700"
            >
              {language === "EN" ? "View All →" : "Tingnan Lahat →"}
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm divide-y">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{categoryIcons[tx.category] || "💳"}</span>
                  <div>
                    <p className="font-semibold text-sm capitalize">{tx.category}</p>
                    <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                  </div>
                </div>
                <p className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'income' ? '+' : '-'}₱{tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mx-4 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          {language === "EN" ? "⚡ Quick Actions" : "⚡ Mabilis na Aksyon"}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/quick-add")}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
          >
            <div className="text-3xl mb-2">⚡</div>
            <p className="font-semibold">
              {language === "EN" ? "Quick Add" : "Mabilis"}
            </p>
          </button>
           <button
            onClick={() => navigate("/expense-input")}
            className="card text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-2">💸</div>
            <p className="font-semibold">
              {language === "EN" ? "Add Expense" : "Magdagdag ng Gastos"}
            </p>
          </button>
          <button
            onClick={() => navigate("/income-input")}
            className="card text-center hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-2">💰</div>
            <p className="font-semibold">
              {language === "EN" ? "Add Income" : "Magdagdag ng Kita"}
            </p>
          </button>
          <button
            onClick={() => navigate("/budget-planner")}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
          >
            <div className="text-3xl mb-2">📊</div>
            <p className="font-semibold">
              {language === "EN" ? "Budget" : "Budget"}
            </p>
          </button>
          {/* <button
            onClick={() => navigate("/profile")}
            className="bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
          >
            <div className="text-3xl mb-2">👤</div>
            <p className="font-semibold">
              {language === "EN" ? "Profile" : "Profile"}
            </p>
          </button> */}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomeScreen;