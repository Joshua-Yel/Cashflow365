import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, set } from "firebase/database";
import { auth, db } from "../firebaseConfig";

const SetupProfileScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !monthlyIncome) return;

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const profileRef = ref(db, `users/${user.uid}/profile`);
      await set(profileRef, {
        name,
        monthlyIncome: parseFloat(monthlyIncome),
        createdAt: new Date().toISOString(),
      });
      navigate("/");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Profile</h1>
          <p className="text-gray-600">Tell us about yourself to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="input-label">Full Name</label>
            <input
              type="text"
              className="input"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="input-label">Monthly Income (₱)</label>
            <input
              type="number"
              className="input"
              placeholder="Enter your monthly income"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Setting up...
              </>
            ) : (
              "Complete Setup"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupProfileScreen;
