import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { auth, db } from "../firebaseConfig";
import BottomNav from "../navigation/BottomNav";
import useDashboardAI from "../hooks/useDashboardAI";

interface PredictionData {
  period: string;
  income: number;
  expenses: number;
  balance: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface AIInsight {
  type: 'warning' | 'tip' | 'insight';
  title: string;
  message: string;
  action?: string;
}

const texts = {
  EN: {
    title: "AI Predictions",
    cashFlowForecast: "Cash Flow Forecast",
    aiInsights: "AI Insights",
    riskAssessment: "Risk Assessment",
    recommendations: "Recommendations",
    next4Weeks: "Next 4 Weeks",
    currentBalance: "Current Balance",
    predictedShortfall: "Predicted Shortfall",
    riskLevel: "Risk Level",
    lowRisk: "Low Risk",
    mediumRisk: "Medium Risk",
    highRisk: "High Risk",
    getInsights: "Get AI Insights",
    refreshData: "Refresh Data",
    categories: {
      income: "Income",
      expenses: "Expenses",
      balance: "Balance",
    },
  },
  FIL: {
    title: "AI Predictions",
    cashFlowForecast: "Cash Flow Forecast",
    aiInsights: "AI Insights",
    riskAssessment: "Risk Assessment",
    recommendations: "Mga Rekomendasyon",
    next4Weeks: "Susunod na 4 na Linggo",
    currentBalance: "Kasalukuyang Balanse",
    predictedShortfall: "Predicted Shortfall",
    riskLevel: "Risk Level",
    lowRisk: "Mababang Risk",
    mediumRisk: "Katamtamang Risk",
    highRisk: "Mataas na Risk",
    getInsights: "Kumuha ng AI Insights",
    refreshData: "I-refresh ang Data",
    categories: {
      income: "Kita",
      expenses: "Gastos",
      balance: "Balanse",
    },
  },
};

const PredictionsScreen: React.FC = () => {
  const [language, setLanguage] = useState("EN");
  const [currentBalance, setCurrentBalance] = useState(0);
  const [predictedShortfall, setPredictedShortfall] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate();

  const currentTexts = texts[language as keyof typeof texts];

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
          const transactions = Object.values(expensesData);
          const calculatedExpenses = transactions.reduce(
            (sum: number, item: any) => sum + (item.amount || 0),
            0
          );
          setTotalExpenses(calculatedExpenses);
        },
        (error) => console.error("Firebase expenses read error:", error)
      )
    );

    setLoading(false);

    return () => {
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // Calculate current balance and predictions
  useEffect(() => {
    const initialBalance = 0; // This should come from user profile
    const balance = initialBalance + totalIncome - totalExpenses;
    setCurrentBalance(balance);

    // Generate predictions for next 4 weeks
    const generatePredictions = () => {
      const recurringIncome = totalIncome * 0.7; // Assume 70% is recurring
      const recurringExpenses = totalExpenses * 0.8; // Assume 80% is recurring
      
      const periodNames = {
        EN: ["This Week", "Next Week", "Week 3", "Week 4"],
        FIL: ["Ngayong Linggo", "Susunod na Linggo", "Ika-3 Linggo", "Ika-4 na Linggo"],
      };

      const newPredictions: PredictionData[] = [];
      let weekBalance = balance;

      for (let i = 0; i < 4; i++) {
        const weeklyIncome = recurringIncome / 4;
        const weeklyExpenses = recurringExpenses / 4;
        weekBalance += weeklyIncome - weeklyExpenses;

        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        if (weekBalance < 0) riskLevel = 'high';
        else if (weekBalance < 1000) riskLevel = 'medium';

        newPredictions.push({
          period: periodNames[language as keyof typeof periodNames][i] || `Week ${i + 1}`,
          income: Math.round(weeklyIncome),
          expenses: Math.round(weeklyExpenses),
          balance: Math.round(weekBalance),
          riskLevel,
        });
      }

      setPredictions(newPredictions);

      // Calculate predicted shortfall
      const lowestBalance = Math.min(...newPredictions.map(p => p.balance));
      setPredictedShortfall(lowestBalance < 0 ? Math.abs(lowestBalance) : 0);
    };

    generatePredictions();
  }, [totalIncome, totalExpenses, language]);

  // AI-Powered Dashboard Analysis Hook
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
      const insights: AIInsight[] = alerts.map(alert => ({
        type: alert.type === 'critical' ? 'warning' : alert.type === 'warning' ? 'tip' : 'insight',
        title: alert.type === 'critical' ? 'Critical Alert' : alert.type === 'warning' ? 'Warning' : 'Insight',
        message: alert.message,
        action: alert.solution,
      }));
      setAiInsights(insights);
    }
  }, [alerts]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return currentTexts.highRisk;
      case 'medium': return currentTexts.mediumRisk;
      default: return currentTexts.lowRisk;
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "FIL" : "EN");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
          <p className="mt-4 text-gray-600">Loading predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Screen Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
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
        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">₱{currentBalance.toLocaleString()}</div>
            <div className="text-sm text-gray-600">{currentTexts.currentBalance}</div>
          </div>
          <div className="card text-center">
            <div className={`text-2xl font-bold ${predictedShortfall > 0 ? 'text-red-600' : 'text-green-600'}`}>
              ₱{predictedShortfall.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">{currentTexts.predictedShortfall}</div>
          </div>
        </div>

        {/* Cash Flow Forecast */}
        <div className="card">
          <h2 className="card-title">{currentTexts.cashFlowForecast}</h2>
          <p className="text-sm text-gray-600 mb-4">{currentTexts.next4Weeks}</p>
          
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{prediction.period}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(prediction.riskLevel)}`}>
                    {getRiskText(prediction.riskLevel)}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">₱{prediction.income.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">{currentTexts.categories.income}</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">₱{prediction.expenses.toLocaleString()}</div>
                    <div className="text-xs text-gray-600">{currentTexts.categories.expenses}</div>
                  </div>
                  <div>
                    <div className={`text-lg font-bold ${prediction.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      ₱{prediction.balance.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">{currentTexts.categories.balance}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        {aiInsights.length > 0 && (
          <div className="card bg-blue-50 border-blue-200">
            <h2 className="card-title text-blue-800">🤖 {currentTexts.aiInsights}</h2>
            
            <div className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  insight.type === 'warning' ? 'bg-red-100 border-l-4 border-red-500' :
                  insight.type === 'tip' ? 'bg-green-100 border-l-4 border-green-500' :
                  'bg-blue-100 border-l-4 border-blue-500'
                }`}>
                  <h3 className="font-semibold text-gray-800 mb-2">{insight.title}</h3>
                  <p className="text-gray-700 mb-2">{insight.message}</p>
                  {insight.action && (
                    <p className="text-sm text-gray-600 italic">💡 {insight.action}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        <div className="card">
          <h2 className="card-title">{currentTexts.riskAssessment}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">{currentTexts.riskLevel}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                predictedShortfall > 5000 ? getRiskColor('high') :
                predictedShortfall > 1000 ? getRiskColor('medium') :
                getRiskColor('low')
              }`}>
                {predictedShortfall > 5000 ? getRiskText('high') :
                 predictedShortfall > 1000 ? getRiskText('medium') :
                 getRiskText('low')}
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              {predictedShortfall > 0 ? (
                language === "EN" 
                  ? `Based on your current spending patterns, you may face a shortfall of ₱${predictedShortfall.toLocaleString()} in the coming weeks.`
                  : `Batay sa inyong kasalukuyang mga pattern ng paggastos, maaari kayong makaranas ng kakulangan na ₱${predictedShortfall.toLocaleString()} sa mga susunod na linggo.`
              ) : (
                language === "EN"
                  ? "Your financial outlook looks positive! You're on track to maintain a healthy balance."
                  : "Ang inyong financial outlook ay mukhang positibo! Nasa tamang landas kayo upang mapanatili ang malusog na balanse."
              )}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default PredictionsScreen;