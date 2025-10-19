import { useState, useEffect, useCallback } from "react";
import { getAI, getGenerativeModel, GoogleAIBackend } from "@firebase/ai";
import { app } from "../firebaseConfig";

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-1.5-flash" });

interface Category {
  id: string;
  budget: number;
  spent: number;
  label: string;
}

interface Suggestion {
  type: 'loading' | 'warning' | 'tip' | 'insight';
  text: string;
}

interface BudgetWarning {
  type: 'warning';
  message: string;
}

interface PredictedImpact {
  budgetUsage: number;
  remainingBudget: number;
  daysUntilPayday: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface AIState {
  isLoading: boolean;
  suggestions: Suggestion[];
  budgetWarning: BudgetWarning | null;
  predictedImpact: PredictedImpact | null;
  showInsights: boolean;
}

const useExpenseAI = (
  amount: string,
  category: string,
  categories: Category[],
  language: string,
  categoryLabels: Record<string, Record<string, string>>,
  allTexts: Record<string, any>
) => {
  const [aiState, setAiState] = useState<AIState>({
    isLoading: false,
    suggestions: [],
    budgetWarning: null,
    predictedImpact: null,
    showInsights: false,
  });

  const analyzeExpenseWithAI = useCallback(async () => {
    const currentTexts = allTexts[language];
    if (!currentTexts) return;

    const expenseAmount = parseFloat(amount);
    if (!expenseAmount || !category) return;

    const selectedCategory = categories.find((cat) => cat.id === category);
    if (!selectedCategory) return;

    setAiState((prevState) => ({
      ...prevState,
      isLoading: true,
      showInsights: true,
      suggestions: [{ type: "loading", text: currentTexts.aiAnalyzing }],
      budgetWarning: null,
    }));

    const newSpent = selectedCategory.spent + expenseAmount;
    const budgetUsage = (newSpent / selectedCategory.budget) * 100;

    setAiState((prevState) => ({
      ...prevState,
      predictedImpact: {
        budgetUsage,
        remainingBudget: selectedCategory.budget - newSpent,
        daysUntilPayday: 12, // This can be made dynamic later
        riskLevel:
          budgetUsage > 90 ? "high" : budgetUsage > 70 ? "medium" : "low",
      },
    }));

    try {
      const prompt = `You are a friendly Filipino financial assistant for an app called Cashflow365. A user is about to log an expense. Provide a single, concise, and actionable tip or insight based on their situation. The user's preferred language is ${
        language === "EN" ? "English" : "Tagalog/Filipino"
      }. Respond in that language. Do not use markdown. Just return a single sentence.

      Context:
      - Expense Amount: ₱${expenseAmount.toLocaleString()}
      - Category: ${categoryLabels[language][selectedCategory.id]}
      - Budget for this category: ₱${selectedCategory.budget.toLocaleString()}
      - Amount already spent in this category: ₱${selectedCategory.spent.toLocaleString()}
      - Budget usage after this expense: ${budgetUsage.toFixed(0)}%

      Generate one suggestion now.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const suggestionText = response.text();

      let budgetWarning: BudgetWarning | null = null;
      if (budgetUsage > 85) {
        budgetWarning = {
          type: "warning",
          message:
            language === "EN"
              ? `This expense will use ${budgetUsage.toFixed(0)}% of your '${
                  categoryLabels[language][selectedCategory.id]
                }' budget!`
              : `Ang gastong ito ay gagamitin ang ${budgetUsage.toFixed(
                  0
                )}% ng inyong '${
                  categoryLabels[language][selectedCategory.id]
                }' budget!`,
        };
      }

      setAiState((prevState) => ({
        ...prevState,
        isLoading: false,
        suggestions: [{ type: "insight", text: suggestionText }],
        budgetWarning,
      }));
    } catch (e) {
      console.error("AI suggestion generation failed:", e);
      let fallbackText =
        language === "EN"
          ? "Could not get an AI suggestion right now."
          : "Hindi makakuha ng AI suggestion sa ngayon.";

      if ((e as any).code === "AI/api-not-enabled") {
        fallbackText =
          language === "EN"
            ? "AI feature is not yet active. Please try again in a few minutes."
            : "Hindi pa aktibo ang AI feature. Pakisubukang muli sa ilang minuto.";
      }

      setAiState((prevState) => ({
        ...prevState,
        isLoading: false,
        suggestions: [{ type: "warning", text: fallbackText }],
      }));
    }
  }, [amount, category, categories, language, categoryLabels, allTexts]);

  useEffect(() => {
    if (!amount || !category) {
      setAiState({
        isLoading: false,
        suggestions: [],
        budgetWarning: null,
        predictedImpact: null,
        showInsights: false,
      });
      return;
    }
    const handler = setTimeout(() => {
      analyzeExpenseWithAI();
    }, 1500);
    return () => {
      clearTimeout(handler);
    };
  }, [amount, category, categories, analyzeExpenseWithAI]);

  const resetAIState = () => {
    setAiState({
      isLoading: false,
      suggestions: [],
      budgetWarning: null,
      predictedImpact: null,
      showInsights: false,
    });
  };

  return { ...aiState, resetAIState };
};

export default useExpenseAI;
