import React from "react";

const SplashScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
      <div className="text-center text-white">
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-4">CASHFLOW365</h1>
          <p className="text-xl opacity-90">Your Personal Finance Assistant</p>
        </div>
        
        <div className="flex justify-center">
          <div className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
        </div>
        
        <p className="mt-6 text-lg opacity-75">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
