import { useState, useEffect, useCallback } from "react";
import { getAI, getGenerativeModel, GoogleAIBackend } from "@firebase/ai";
import { app } from "../firebaseConfig";

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-1.5-flash" });

const usePredictionsAI = (expenses, riskLevel, language, loading) => {
  const [aiState, setAiState] = useState({
    isLoading: true,
    recommendations: [],
  });

  const analyzeForRecommendations = useCallback(async () => {
    if (loading || expenses.length === 0 || riskLevel === undefined) {
      setAiState({ isLoading: true, recommendations: [] });
      return;
    }

    setAiState({ isLoading: true, recommendations: [] });

    // Pre-process data for the prompt
    const categoryTotals = {};
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    expenses
      .filter((e) => e.createdAt > oneMonthAgo.getTime())
      .forEach((e) => {
        categoryTotals[e.category] =
          (categoryTotals[e.category] || 0) + e.amount;
      });

    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => `${category}: ₱${Math.round(amount)}`)
      .join(", ");

    const prompt = `You are a sharp and insightful Filipino financial analyst for an app called Cashflow365.
    Analyze the user's financial risk and spending habits to generate 3 concise, actionable recommendations.
    The user's preferred language is ${language === "EN" ? "English" : "Tagalog/Filipino"}. Respond in that language.

    Context:
    - Financial Risk Level: ${(riskLevel * 100).toFixed(0)}% (where higher is more risk)
    - Top Spending Categories (last 30 days): ${sortedCategories || "None"}

    Instructions:
    - Generate a JSON array of 3 recommendation objects.
    - Each object must have 'id' (a unique number), 'text' (the recommendation), 'impact' (an estimated monthly savings in ₱), and 'priority' ('high', 'medium', 'low').
    - If 'riskLevel' is high (e.g., > 80%), the top priority recommendation MUST address this directly.
    - Create specific, creative recommendations based on the top spending categories. For example, if 'food' is high, suggest meal prepping or using a specific budget-friendly recipe app. If 'transport' is high, suggest a carpool app or checking public transport routes.
    - Ensure the 'impact' amount is a realistic monthly saving from following the advice.
    - The tone should be empowering and strategic.

    Example Output:
    [
      {"id": 1, "text": "Your risk level is high. Focus on reducing spending in your top category, 'food', to build a buffer.", "impact": 1500, "priority": "high"},
      {"id": 2, "text": "Try a 'no-spend' weekend challenge to boost your savings and reset spending habits.", "impact": 1000, "priority": "medium"},
      {"id": 3, "text": "Automate a small transfer of ₱200 to your savings account every payday.", "impact": 200, "priority": "low"}
    ]

    Generate the JSON array now.`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const cleanedText = response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      const recommendations = JSON.parse(cleanedText);

      setAiState({
        isLoading: false,
        recommendations,
      });
    } catch (e) {
      console.error("Predictions AI generation failed:", e);
      const fallbackTexts = {
        EN: "Could not get AI recommendations at the moment.",
        FIL: "Hindi makakuha ng mga mungkahi mula sa AI sa ngayon.",
      };
      setAiState({
        isLoading: false,
        recommendations: [
          { id: 99, text: fallbackTexts[language], impact: 0, priority: "low" },
        ],
      });
    }
  }, [expenses, riskLevel, language, loading]);

  useEffect(() => {
    analyzeForRecommendations();
  }, [analyzeForRecommendations]);

  return aiState;
};

export default usePredictionsAI;
