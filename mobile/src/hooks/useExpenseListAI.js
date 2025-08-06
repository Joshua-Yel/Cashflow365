import { useState, useEffect, useCallback } from "react";
import { getAI, getGenerativeModel, GoogleAIBackend } from "@firebase/ai";
import { app } from "../firebaseConfig";

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-1.5-flash" });

const useExpenseListAI = (
  profile,
  expenses,
  weeklyTotal,
  language,
  loading
) => {
  const [aiState, setAiState] = useState({
    isLoading: true,
    predictions: [],
  });

  const analyzeExpenses = useCallback(async () => {
    if (loading || !profile || expenses.length === 0) {
      setAiState({ isLoading: true, predictions: [] });
      return;
    }

    setAiState({ isLoading: true, predictions: [] });

    // --- Pre-process data for the prompt ---
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyExpenses = expenses.filter(
      (exp) => exp.createdAt >= startOfWeek.getTime()
    );

    const weeklyCategoryTotals = weeklyExpenses.reduce((acc, expense) => {
      if (expense.category) {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      }
      return acc;
    }, {});

    const topCategoryEntry = Object.entries(weeklyCategoryTotals).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const topCategoryName = topCategoryEntry ? topCategoryEntry[0] : "None";
    // --- End of pre-processing ---

    const prompt = `You are a sharp and predictive Filipino financial analyst for an app called Cashflow365.
    Analyze the user's recent expenses to generate 2-3 concise, data-driven **predictions** about their future spending. Avoid giving generic tips or suggestions. Focus on what is likely to happen.
    The user's preferred language is ${language === "en" ? "English" : "Tagalog/Filipino"}. Respond in that language.

    Context:
    - User's Monthly Income: ₱${
      profile.monthlyIncome?.toLocaleString() || "Not set"
    }
    - Total expenses this week: ₱${weeklyTotal.toLocaleString()}
    - Top spending category this week: ${topCategoryName}

    Instructions:
    - Generate a JSON array of 2-3 prediction objects.
    - Each object must have 'type' ('prediction', 'warning'), 'icon' (an emoji), 'title' (a short, catchy prediction title), 'message' (the detailed prediction), 'amount' (an optional relevant amount as a string like '₱1,200'), and 'color' (a hex code: '#e74c3c' for warning, '#3498db' for prediction).
    - **Prediction 1 (Spending Forecast):** Based on the 'Total expenses this week', project their total spending for the month. For example: "At this rate, you are projected to spend ~₱X this month."
    - **Prediction 2 (Category Overspend):** If a top spending category is identified, predict if they are on track to go over a typical budget for that category. For example: "Your 'Food' spending is high. You are on track to exceed a typical 25% food budget." If no top category, make another general prediction.
    - **Prediction 3 (Next Big Expense):** Based on their transaction history, predict their next likely large expense (e.g., a recurring bill or a pattern of large purchases). For example: "Your next large expense is likely to be your 'Internet' bill around [date]."
    - The tone should be neutral and predictive.

    Example Output:
    [
      {"type": "prediction", "icon": "📈", "title": "Monthly Spending Forecast", "message": "At your current rate, you're projected to spend ~₱${(
        weeklyTotal * 4
      ).toLocaleString()} this month.", "amount": "₱${(
        weeklyTotal * 4
      ).toLocaleString()}", "color": "#3498db"},
      {"type": "warning", "icon": "⚠️", "title": "Food Budget Alert", "message": "Your 'Food' spending is high. You are on track to exceed a typical 25% food budget.", "color": "#e74c3c"}
    ]

    Generate the JSON array now.`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const cleanedText = response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      const predictions = JSON.parse(cleanedText);

      setAiState({
        isLoading: false,
        predictions,
      });
    } catch (e) {
      console.error("Expense List AI generation failed:", e);
      const fallbackTexts = {
        en: { title: "AI Error", message: "Could not get AI predictions." },
        fil: { title: "AI Error", message: "Hindi makuha ang mga hula ng AI." },
      };
      setAiState({
        isLoading: false,
        predictions: [
          {
            type: "warning",
            icon: "⚙️",
            title: fallbackTexts[language].title,
            message: fallbackTexts[language].message,
            color: "#e74c3c",
          },
        ],
      });
    }
  }, [profile, expenses, weeklyTotal, language, loading]);

  useEffect(() => {
    analyzeExpenses();
  }, [analyzeExpenses]);

  return aiState;
};

export default useExpenseListAI;
