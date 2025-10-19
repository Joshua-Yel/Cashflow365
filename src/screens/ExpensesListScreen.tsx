import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../navigation/BottomNav";

const ExpensesListScreen: React.FC = () => {
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
        <h1 className="text-lg font-bold text-gray-800">Expenses History</h1>
        <div></div>
      </div>

      <div className="p-4">
        <div className="card text-center">
          <h2 className="text-xl font-bold mb-4">Expenses List Screen</h2>
          <p className="text-gray-600 mb-4">
            This screen will display all expenses with features like:
          </p>
          <ul className="text-left text-gray-600 space-y-2">
            <li>• Chronological list of all expenses</li>
            <li>• Filtering by category and date range</li>
            <li>• Search functionality</li>
            <li>• Edit and delete options</li>
            <li>• Export capabilities</li>
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ExpensesListScreen;
