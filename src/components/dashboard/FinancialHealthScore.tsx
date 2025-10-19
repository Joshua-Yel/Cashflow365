import React from "react";

interface FinancialHealthScoreProps {
  language: string;
  currentBalance: number;
  predictedShortfall: number;
}

// Centralized translations for the component
const translations = {
  title: {
    EN: "Financial Health Score",
    FIL: "Financial Health Score",
  },
  status: {
    Excellent: { EN: "Healthy", FIL: "Maayos" },
    Good: { EN: "Warning", FIL: "Babala" },
    Poor: { EN: "Critical", FIL: "Mapanganib" },
  },
  timeframe: {
    EN: "Next 2 weeks",
    FIL: "Susunod na 2 linggo",
  },
  balance: {
    EN: "Current Balance:",
    FIL: "Kasalukuyang Balanse:",
  },
};

const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({
  language,
  currentBalance,
  predictedShortfall,
}) => {
  const score = Math.round(
    Math.max(0, 100 - (predictedShortfall / currentBalance) * 100)
  );

  const getHealthScoreColor = () => {
    if (score >= 80) return "#27ae60"; // Green
    if (score >= 60) return "#f39c12"; // Yellow
    return "#e74c3c"; // Red
  };

  const getHealthScoreText = () => {
    if (score >= 80) return translations.status.Excellent[language as keyof typeof translations.status.Excellent];
    if (score >= 60) return translations.status.Good[language as keyof typeof translations.status.Good];
    return translations.status.Poor[language as keyof typeof translations.status.Poor];
  };

  return (
    <div
      className="card text-white rounded-xl p-6 mx-4 mb-6"
      style={{
        backgroundColor: getHealthScoreColor(),
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">
          {translations.title[language as keyof typeof translations.title]}
        </h3>
        <span className="text-3xl font-bold">{score}%</span>
      </div>
      <p className="text-sm opacity-90 mb-2">
        {getHealthScoreText()} • {translations.timeframe[language as keyof typeof translations.timeframe]}
      </p>
      <p className="text-lg font-bold">
        {translations.balance[language as keyof typeof translations.balance]} ₱{currentBalance.toLocaleString()}
      </p>
    </div>
  );
};

export default FinancialHealthScore;
