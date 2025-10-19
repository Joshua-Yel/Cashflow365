import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../navigation/BottomNav";

const DetailedAnalysisScreen: React.FC = () => {
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
        <h1 className="text-lg font-bold text-gray-800">Detailed Analysis</h1>
        <div></div>
      </div>

      <div className="p-4">
        <div className="card text-center">
          <h2 className="text-xl font-bold mb-4">Detailed Analysis Screen</h2>
          <p className="text-gray-600 mb-4">
            This screen will provide comprehensive financial analysis including:
          </p>
          <ul className="text-left text-gray-600 space-y-2">
            <li>• Spending trends and patterns</li>
            <li>• Category-wise breakdowns</li>
            <li>• Monthly/yearly comparisons</li>
            <li>• Savings rate analysis</li>
            <li>• Interactive charts and graphs</li>
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default DetailedAnalysisScreen;
