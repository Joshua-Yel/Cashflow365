import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, push, serverTimestamp } from "firebase/database";
import { auth, db } from "../firebaseConfig";
import BottomNav from "../navigation/BottomNav";

const QuickAddScreen: React.FC = () => {
  const navigate = useNavigate();
  const [language] = useState("EN");
  const [transactionType, setTransactionType] = useState<"expense" | "income">("expense");
  const [displayValue, setDisplayValue] = useState("0");
  const [currentValue, setCurrentValue] = useState("0");
  const [operator, setOperator] = useState<string | null>(null);
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<string>("monthly");
  const [isSaving, setIsSaving] = useState(false);

  const expenseCategories = [
    { id: "food", label: "Food", icon: "🍔" },
    { id: "transport", label: "Transport", icon: "🚗" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
    { id: "bills", label: "Bills", icon: "📄" },
    { id: "health", label: "Health", icon: "⚕️" },
    { id: "entertainment", label: "Fun", icon: "🎮" },
  ];

  const incomeCategories = [
    { id: "salary", label: "Salary", icon: "💼" },
    { id: "freelance", label: "Freelance", icon: "💻" },
    { id: "business", label: "Business", icon: "🏪" },
    { id: "investment", label: "Investment", icon: "📈" },
    { id: "gift", label: "Gift", icon: "🎁" },
    { id: "other", label: "Other", icon: "💰" },
  ];

  const frequencies = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
  ];

  const currentCategories = transactionType === "expense" ? expenseCategories : incomeCategories;

  const handleNumberInput = (num: number | string) => {
    if (currentValue === "0" && num !== ".") {
      setCurrentValue(String(num));
      setDisplayValue(String(num));
    } else if (num === "." && currentValue.includes(".")) {
      return;
    } else {
      const newValue = currentValue + String(num);
      setCurrentValue(newValue);
      setDisplayValue(newValue);
    }
  };

  const handleOperatorInput = (op: string) => {
    if (operator && previousValue) {
      handleEquals();
    }
    setOperator(op);
    setPreviousValue(currentValue);
    setCurrentValue("0");
  };

  const handleEquals = () => {
    if (!operator || !previousValue) return;

    const prev = parseFloat(previousValue);
    const curr = parseFloat(currentValue);
    let result = 0;

    switch (operator) {
      case "+":
        result = prev + curr;
        break;
      case "-":
        result = prev - curr;
        break;
      case "*":
        result = prev * curr;
        break;
      case "/":
        result = curr !== 0 ? prev / curr : 0;
        break;
    }

    setDisplayValue(result.toFixed(2));
    setCurrentValue(result.toFixed(2));
    setOperator(null);
    setPreviousValue(null);
  };

  const handleClear = () => {
    setDisplayValue("0");
    setCurrentValue("0");
    setOperator(null);
    setPreviousValue(null);
  };

  const handleSave = async () => {
    const amount = parseFloat(displayValue);
    
    if (amount <= 0) {
      alert(language === "EN" ? "Enter an amount" : "Maglagay ng halaga");
      return;
    }
    if (!category) {
      alert(language === "EN" ? "Select a category" : "Pumili ng kategorya");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    setIsSaving(true);

    const transactionData = {
      amount,
      category,
      isRecurring,
      recurringFrequency: isRecurring ? recurringFrequency : null,
      createdAt: serverTimestamp(),
      description: `Quick Add - ${category}`,
    };

    const path = `users/${user.uid}/${transactionType}s`;
    const dbRef = ref(db, path);

    try {
      await push(dbRef, transactionData);
      
      // Success feedback
      const successMsg = document.createElement("div");
      successMsg.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-8 py-4 rounded-full text-xl font-bold shadow-2xl z-50";
      successMsg.style.animation = "bounce 0.5s ease-in-out";
      successMsg.textContent = language === "EN" ? "✓ Saved!" : "✓ Na-save!";
      document.body.appendChild(successMsg);

      setTimeout(() => {
        successMsg.remove();
        handleClear();
        setCategory(null);
        setIsRecurring(false);
      }, 1000);

    } catch (error) {
      console.error(error);
      alert(language === "EN" ? "Could not save transaction" : "Hindi ma-save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="text-2xl text-gray-600">←</button>
        <h1 className="text-lg font-bold text-gray-800">
          {language === "EN" ? "Quick Add" : "Mabilis"}
        </h1>
        <button onClick={handleClear} className="text-sm text-red-500 font-semibold">
          {language === "EN" ? "Clear" : "Linis"}
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Type Selector */}
        <div className="flex gap-2 p-3 bg-white">
          <button
            onClick={() => {
              setTransactionType("expense");
              setCategory(null);
            }}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              transactionType === "expense"
                ? "bg-red-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600"
            }`}
          >
             {language === "EN" ? "Expense" : "Gastos"}
          </button>
          <button
            onClick={() => {
              setTransactionType("income");
              setCategory(null);
            }}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              transactionType === "income"
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600"
            }`}
          >
             {language === "EN" ? "Income" : "Kita"}
          </button>
        </div>

        {/* Display */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 shadow-lg">
          <div className="text-right">
            <div className="text-white text-5xl font-bold break-words">
              ₱{parseFloat(displayValue || "0").toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        {/* Category Selector */}
        <div className="bg-white p-3 border-b">
          <div className="text-xs font-bold text-gray-600 mb-2">
            {language === "EN" ? "CATEGORY" : "KATEGORYA"}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {currentCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                  category === cat.id
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recurring Toggle */}
        <div className="bg-white px-3 py-2 border-b">
          <button
            onClick={() => setIsRecurring(!isRecurring)}
            className="flex items-center gap-2"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              isRecurring ? "bg-blue-500 border-blue-500" : "border-gray-300"
            }`}>
              {isRecurring && <span className="text-white text-xs">✓</span>}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {language === "EN" ? "Recurring Transaction" : "Paulit-ulit"}
            </span>
          </button>
        </div>

        {/* Frequency Selector */}
        {isRecurring && (
          <div className="bg-white p-3 border-b">
            <div className="text-xs font-bold text-gray-600 mb-2">
              {language === "EN" ? "FREQUENCY" : "DALAS"}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {frequencies.map((freq) => (
                <button
                  key={freq.id}
                  onClick={() => setRecurringFrequency(freq.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                    recurringFrequency === freq.id
                      ? "bg-purple-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Calculator Keypad - Mobile Optimized */}
        <div className="flex-1 bg-gray-100 p-3">
          <div className="max-w-md mx-auto">
            {/* Top Row: C ÷ × − */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              <button
                onClick={handleClear}
                className="bg-red-400 text-white rounded-xl py-4 text-xl font-bold active:bg-red-500"
              >
                C
              </button>
              <button
                onClick={() => handleOperatorInput("/")}
                className="bg-orange-400 text-white rounded-xl py-4 text-xl font-bold active:bg-orange-500"
              >
                ÷
              </button>
              <button
                onClick={() => handleOperatorInput("*")}
                className="bg-orange-400 text-white rounded-xl py-4 text-xl font-bold active:bg-orange-500"
              >
                ×
              </button>
              <button
                onClick={() => handleOperatorInput("-")}
                className="bg-orange-400 text-white rounded-xl py-4 text-xl font-bold active:bg-orange-500"
              >
                −
              </button>
            </div>

            {/* Row: 7 8 9 + */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  className="bg-white text-gray-800 rounded-xl py-4 text-xl font-bold active:bg-gray-200"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => handleOperatorInput("+")}
                className="bg-orange-400 text-white rounded-xl py-4 text-xl font-bold active:bg-orange-500"
              >
                +
              </button>
            </div>

            {/* Row: 4 5 6 = */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  className="bg-white text-gray-800 rounded-xl py-4 text-xl font-bold active:bg-gray-200"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleEquals}
                className="bg-orange-400 text-white rounded-xl py-4 text-xl font-bold active:bg-orange-500"
              >
                =
              </button>
            </div>

            {/* Bottom Rows: 1 2 3 with Enter, then 0 . with Enter */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  className="bg-white text-gray-800 rounded-xl py-4 text-xl font-bold active:bg-gray-200"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`row-span-2 rounded-xl text-white font-bold text-lg transition-all ${
                  transactionType === "expense" ? "bg-red-500 active:bg-red-600" : "bg-green-500 active:bg-green-600"
                } disabled:opacity-50`}
              >
                {isSaving ? "..." : (language === "EN" ? "Enter" : "OK")}
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleNumberInput(0)}
                className="col-span-2 bg-white text-gray-800 rounded-xl py-4 text-xl font-bold active:bg-gray-200"
              >
                0
              </button>
              <button
                onClick={() => handleNumberInput(".")}
                className="bg-white text-gray-800 rounded-xl py-4 text-xl font-bold active:bg-gray-200"
              >
                .
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default QuickAddScreen;