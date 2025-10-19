import React from "react";
import { useNavigate } from "react-router-dom";

const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-white">
      <div className="max-w-md w-full p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to CASHFLOW365</h1>
        <p className="text-xl mb-8 opacity-90">
          Your personal finance assistant powered by AI
        </p>
        <button
          onClick={() => navigate("/setup-profile")}
          className="btn btn-primary bg-white text-blue-600 hover:bg-gray-100"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
