import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";

// Import screens
import SplashScreen from "./screens/SplashScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import SetupProfileScreen from "./screens/SetupProfileScreen";
import HomeScreen from "./screens/HomeScreen";
import ExpenseInputScreen from "./screens/ExpenseInputScreen";
import IncomeInputScreen from "./screens/IncomeInputScreen";
import PredictionScreen from "./screens/PredictionsScreen";
import ExpensesListScreen from "./screens/ExpensesListScreen";
import Login from "./components/authentication/Login";
import Registration from "./components/authentication/Registration";
import DetailedAnalysisScreen from "./screens/DetailedAnalysisScreen";
import BudgetPlannerScreen from "./screens/BudgetPlannerScreen";
import SavingsGoalsScreen from "./screens/SavingsGoalsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import QuickAddScreen from "./screens/QuickAddScreen";

// Global styles are imported in index.css

const App: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const authSubscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setInitializing(false);
        setProfileExists(false);
      }
    });
    return authSubscriber;
  }, []);

  useEffect(() => {
    if (!user) return;

    const profileRef = ref(db, `users/${user.uid}/profile`);
    const profileSubscriber = onValue(
      profileRef,
      (snapshot) => {
        setProfileExists(snapshot.exists() && snapshot.val().name);
        if (initializing) setInitializing(false);
      },
      (error) => {
        console.error("Firebase profile listener error:", error);
        setProfileExists(false);
        if (initializing) setInitializing(false);
      }
    );

    return profileSubscriber;
  }, [user, initializing]);

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {!user ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Registration />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : !profileExists ? (
            <>
              <Route path="/onboarding" element={<OnboardingScreen />} />
              <Route path="/setup-profile" element={<SetupProfileScreen />} />
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/expense-input" element={<ExpenseInputScreen />} />
              <Route path="/income-input" element={<IncomeInputScreen />} />
              <Route path="/predictions" element={<PredictionScreen />} />
              <Route path="/expenses-list" element={<ExpensesListScreen />} />
              <Route path="/detailed-analysis" element={<DetailedAnalysisScreen />} />
              <Route path="/budget-planner" element={<BudgetPlannerScreen />} />
              <Route path="/savings-goals" element={<SavingsGoalsScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
              <Route path="/quick-add" element={<QuickAddScreen />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/register" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
};

export default App;