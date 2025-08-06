import { useState, useEffect, useCallback } from "react";
import { getAI, getGenerativeModel, GoogleAIBackend } from "@firebase/ai";
import { app } from "../firebaseConfig";

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-1.5-flash" });

const useSavingsAI = (rawGoals, profile, expenses, language) => {
  const [aiState, setAiState] = useState({
    isLoading: true,
    insights: [],
    processedGoals: [],
  });

  const analyzeSavings = useCallback(async () => {
    if (!profile?.monthlyIncome || !rawGoals || rawGoals.length === 0) {
      setAiState({
        isLoading: false,
        insights: [],
        processedGoals: rawGoals || [],
      });
      return;
    }

    setAiState((prevState) => ({ ...prevState, isLoading: true }));

    // --- Perform local calculations first ---
    const monthlyIncome = profile.monthlyIncome;
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentExpenses = expenses.filter(
      (e) => new Date(e.createdAt).getTime() > oneMonthAgo.getTime()
    );
    const monthlyExpenses = recentExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );
    const estimatedMonthlySavings = monthlyIncome - monthlyExpenses;
    const estimatedWeeklySpareMoney =
      estimatedMonthlySavings > 0 ? estimatedMonthlySavings / 4 : 0;

    const processedGoals = rawGoals.map((goal) => {
      const remainingAmount = goal.targetAmount - (goal.savedAmount || 0);
      if (remainingAmount <= 0) {
        return { ...goal, projection: "Completed!", isAchievable: true };
      }
      if (estimatedMonthlySavings <= 0) {
        return { ...goal, projection: "N/A", isAchievable: false };
      }

      const monthsToGoal = remainingAmount / estimatedMonthlySavings;
      const projectedDate = new Date();
      projectedDate.setMonth(projectedDate.getMonth() + monthsToGoal);

      const targetDate = new Date(goal.targetDate);
      const isAchievable = projectedDate <= targetDate;

      return {
        ...goal,
        projection: projectedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
        isAchievable,
      };
    });

    const atRiskGoals = processedGoals.filter(
      (g) => !g.isAchievable && g.targetAmount - (g.savedAmount || 0) > 0
    );

    // --- Generate prompt for Gemini ---
    const prompt = `You are a friendly Filipino financial assistant for an app called Cashflow365.
    Analyze the user's savings situation and provide 2-3 concise, actionable insights.
    The user's preferred language is ${language === "EN" ? "English" : "Tagalog/Filipino"}. Respond in that language.

    Context:
    - Estimated Monthly Savings: ₱${estimatedMonthlySavings.toLocaleString()}
    - At-Risk Goals: ${atRiskGoals.map((g) => `'${g.name}'`).join(", ") || "None"}
    - Estimated Weekly Spare Money: ₱${Math.floor(estimatedWeeklySpareMoney).toLocaleString()}

    Instructions:
    - Generate a JSON array of insight objects.
    - Each object must have 'icon' (an emoji), 'text' (the insight), and 'type' ('info', 'warning', 'critical', 'suggestion').
    - If you create a 'suggestion' to contribute spare money, it MUST target the first at-risk goal.
    - The suggestion object MUST also include 'goalId' and 'suggestedAmount'.
    - If there are no at-risk goals but there is spare money, suggest putting it towards the goal with the nearest target date.
    - If monthly savings are negative, provide a 'warning' insight about it.
    - If there are at-risk goals, provide a 'critical' insight about one of them.
    - Always include a general 'info' insight about their savings potential if it's positive.

    Example Output:
    [
      {"icon": "💡", "text": "Based on last month, you can save about ₱${estimatedMonthlySavings.toLocaleString()} per month.", "type": "info"},
      {"icon": "📈", "text": "Your '${atRiskGoals[0]?.name}' goal might be hard to reach on time. Try to increase your monthly savings.", "type": "critical"},
      {"icon": "💸", "text": "AI suggests you have ~₱${Math.floor(estimatedWeeklySpareMoney).toLocaleString()} spare this week. Put it towards your '${atRiskGoals[0]?.name}' goal to catch up. Tap to contribute.", "type": "suggestion", "goalId": "${atRiskGoals[0]?.id}", "suggestedAmount": ${Math.floor(estimatedWeeklySpareMoney)}}
    ]

    Generate the JSON array now.`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      // Clean up the response to make it valid JSON
      const cleanedText = response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      const insights = JSON.parse(cleanedText);

      setAiState({
        isLoading: false,
        insights,
        processedGoals,
      });
    } catch (e) {
      console.error("Savings AI generation failed:", e);
      // Fallback to a simple message on error
      setAiState({
        isLoading: false,
        insights: [
          {
            icon: "⚠️",
            text: "Could not get AI insights at the moment. Projections are still calculated locally.",
            type: "warning",
          },
        ],
        processedGoals,
      });
    }
  }, [rawGoals, profile, expenses, language]);

  useEffect(() => {
    // Only run analysis if we have the necessary data.
    if (profile && rawGoals.length > 0) {
      analyzeSavings();
    } else if (profile === null && rawGoals.length === 0) {
      // Initial state before data is fetched, don't show loading.
      setAiState((s) => ({ ...s, isLoading: false }));
    }
  }, [rawGoals, profile, expenses, analyzeSavings]);

  return aiState;
};

export default useSavingsAI;
