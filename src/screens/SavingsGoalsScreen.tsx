import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../navigation/BottomNav";

const SavingsGoalsScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl text-gray-600 hover:text-gray-800"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-800">Savings Goals</h1>
        <div></div>
      </div>

      <div className="p-4">
        <div className="card text-center">
          <h2 className="text-xl font-bold mb-4">Savings Goals Screen</h2>
          <p className="text-gray-600 mb-4">
            This screen will help you set and track savings goals with:
          </p>
          <ul className="text-left text-gray-600 space-y-2">
            <li>• Create and manage multiple savings goals</li>
            <li>• Progress tracking with visual indicators</li>
            <li>• AI-powered savings recommendations</li>
            <li>• Timeline and milestone tracking</li>
            <li>• Automatic goal adjustments</li>
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default SavingsGoalsScreen;
