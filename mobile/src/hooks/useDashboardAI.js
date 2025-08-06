import { useState, useEffect, useCallback } from "react";
import { getAI, getGenerativeModel, GoogleAIBackend } from "@firebase/ai";
import { app } from "../firebaseConfig";

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-1.5-flash" });

const useDashboardAI = (
  currentBalance,
  predictedShortfall,
  totalIncome,
  totalExpenses,
  userName,
  language,
  loading
) => {
  const [aiState, setAiState] = useState({
    isLoading: true,
    alerts: [],
  });

  const analyzeDashboard = useCallback(async () => {
    // Don't run if the main component is still loading its base data
    if (loading) {
      setAiState({ isLoading: true, alerts: [] });
      return;
    }

    setAiState({ isLoading: true, alerts: [] });

    const prompt = `You are a friendly and encouraging Filipino financial assistant for an app called Cashflow365.
    Analyze the user's dashboard summary and generate 1-2 concise, actionable alert cards.
    The user's name is ${userName}.
    The user's preferred language is ${language === "EN" ? "English" : "Tagalog/Filipino"}. Respond in that language.

    Context:
    - Current Balance: ₱${currentBalance.toLocaleString()}
    - Predicted Shortfall in next 4 weeks: ₱${predictedShortfall.toLocaleString()}
    - Total Income (this period): ₱${totalIncome.toLocaleString()}
    - Total Expenses (this period): ₱${totalExpenses.toLocaleString()}

    Instructions:
    - Generate a JSON array of alert objects.
    - Each object must have 'id' (a unique string), 'type' ('critical', 'warning', 'info'), 'message' (the main alert text), and 'solution' (a brief, actionable next step).
    - If 'predictedShortfall' is greater than 0, this is the most important issue. Create a 'critical' alert about it.
    - If 'totalExpenses' is high compared to 'totalIncome' (e.g., > 85%) but there's no shortfall, create a 'warning' alert.
    - If the user is doing well (no shortfall, expenses are reasonable), create a positive and encouraging 'info' alert. Congratulate them by name.
    - The tone should be helpful and not alarming, even for critical alerts.

    Example Output (Critical):
    [
      {"id": "shortfall_1", "type": "critical", "message": "AI predicts a potential cash shortfall of ₱${predictedShortfall.toLocaleString()} in the coming weeks.", "solution": "Try to reduce non-essential spending. Check your budget plan for ideas."}
    ]

    Generate the JSON array now.`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const cleanedText = response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      const generatedAlerts = JSON.parse(cleanedText);

      const alertsWithSeen = generatedAlerts.map((alert) => ({
        ...alert,
        seen: false,
      }));

      setAiState({
        isLoading: false,
        alerts: alertsWithSeen,
      });
    } catch (e) {
      console.error("Dashboard AI generation failed:", e);
      const fallbackTexts = {
        EN: "Could not get AI insights at the moment.",
        FIL: "Hindi makakuha ng AI insights sa ngayon.",
      };
      setAiState({
        isLoading: false,
        alerts: [
          {
            id: "error_1",
            type: "warning",
            message: fallbackTexts[language],
            solution: "Please try refreshing the app.",
            seen: false,
          },
        ],
      });
    }
  }, [
    currentBalance,
    predictedShortfall,
    totalIncome,
    totalExpenses,
    userName,
    language,
    loading,
  ]);

  useEffect(() => {
    analyzeDashboard();
  }, [analyzeDashboard]);

  return aiState;
};

export default useDashboardAI;
