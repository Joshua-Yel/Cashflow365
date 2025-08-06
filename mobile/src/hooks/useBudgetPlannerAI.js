import { useState, useEffect, useCallback } from "react";
import { getAI, getGenerativeModel, GoogleAIBackend } from "@firebase/ai";
import { app } from "../firebaseConfig";

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-1.5-flash" });

const useBudgetPlannerAI = (profile, expenses, language) => {
  const [aiState, setAiState] = useState({
    isLoading: true,
    budgetPlan: null,
    aiTips: [],
  });

  const analyzeBudget = useCallback(async () => {
    if (!profile?.monthlyIncome || profile.monthlyIncome === 0) {
      setAiState({ isLoading: false, budgetPlan: null, aiTips: [] });
      return;
    }

    setAiState({ isLoading: true, budgetPlan: null, aiTips: [] });

    // --- Perform local calculations first ---
    const monthlyIncome = profile.monthlyIncome;
    const needsBudget = monthlyIncome * 0.5;
    const wantsBudget = monthlyIncome * 0.3;
    const savingsTarget = monthlyIncome * 0.2;

    const needsCategories = ["bills", "food", "transport", "medicine"];
    const wantsCategories = ["shopping", "entertainment", "other", "education"];

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentExpenses = expenses.filter(
      (e) => e.createdAt > oneMonthAgo.getTime()
    );

    const actualNeeds = recentExpenses
      .filter((e) => needsCategories.includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);

    const actualWants = recentExpenses
      .filter((e) => wantsCategories.includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpenses = actualNeeds + actualWants;
    const actualSavings = monthlyIncome - totalExpenses;

    const plan = {
      monthlyIncome,
      needs: {
        allocated: needsBudget,
        spent: actualNeeds,
        percentage: (actualNeeds / needsBudget) * 100,
      },
      wants: {
        allocated: wantsBudget,
        spent: actualWants,
        percentage: (actualWants / wantsBudget) * 100,
      },
      savings: {
        allocated: savingsTarget,
        actual: actualSavings,
        percentage:
          savingsTarget > 0 ? (actualSavings / savingsTarget) * 100 : 0,
      },
    };

    // --- Generate prompt for Gemini ---
    const prompt = `You are a friendly and strategic Filipino financial coach for an app called Cashflow365.
    Analyze the user's budget based on the 50/30/20 rule and generate 2-3 concise, actionable tips.
    The user's preferred language is ${language === "EN" ? "English" : "Tagalog/Filipino"}. Respond in that language.

    Context (50/30/20 Rule):
    - Needs (50%): Allocated ₱${plan.needs.allocated.toLocaleString()}, Spent ₱${plan.needs.spent.toLocaleString()}
    - Wants (30%): Allocated ₱${plan.wants.allocated.toLocaleString()}, Spent ₱${plan.wants.spent.toLocaleString()}
    - Savings (20%): Target ₱${plan.savings.allocated.toLocaleString()}, Achieved ₱${plan.savings.actual.toLocaleString()}

    Instructions:
    - Generate a JSON array of 2-3 tip objects.
    - Each object must have 'icon' (an emoji), 'text' (the tip), and 'type' ('warning', 'critical', 'info', 'success').
    - If 'Wants' spending is over budget, create a 'warning' tip about it.
    - If 'Needs' spending is over budget, create a 'critical' tip about it.
    - If 'Savings' are below target but positive, create an encouraging 'info' tip.
    - If the user is doing great on all fronts, provide a 'success' tip congratulating them.
    - Make the tips specific and creative. Instead of "cut back", suggest "try a cheaper brand" or "look for free entertainment options".

    Example Output:
    [
      {"icon": "💡", "text": "Your spending on 'Wants' is a bit high. Try swapping one paid subscription for a free alternative this month.", "type": "warning"},
      {"icon": "📈", "text": "You're close to your savings goal! Try to save ₱${(plan.savings.allocated - plan.savings.actual).toLocaleString()} more by setting up a small, automatic transfer.", "type": "info"}
    ]

    Generate the JSON array now.`;

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const cleanedText = response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      const aiTips = JSON.parse(cleanedText);

      setAiState({ isLoading: false, budgetPlan: plan, aiTips });
    } catch (e) {
      console.error("Budget Planner AI generation failed:", e);
      setAiState({
        isLoading: false,
        budgetPlan: plan, // Still provide the calculated plan
        aiTips: [
          {
            icon: "⚠️",
            text: "Could not get AI tips at the moment. Please check your connection.",
            type: "warning",
          },
        ],
      });
    }
  }, [profile, expenses, language]);

  useEffect(() => {
    if (profile && expenses) {
      analyzeBudget();
    }
  }, [profile, expenses, analyzeBudget]);

  return aiState;
};

export default useBudgetPlannerAI;
