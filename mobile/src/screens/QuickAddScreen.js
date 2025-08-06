import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { ref, push, serverTimestamp } from "firebase/database";
import BottomNav from "../navigation/BottomNav";

const expenseCategories = [
  { id: "food", label: "Food", icon: "🍽️" },
  { id: "transport", label: "Transport", icon: "🚌" },
  { id: "bills", label: "Bills", icon: "💡" },
  { id: "entertainment", label: "Entertainment", icon: "🎬" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "other", label: "Other", icon: "📎" },
];

const incomeCategories = [
  { id: "salary", label: "Salary", icon: "💵" },
  { id: "side_hustle", label: "Side Hustle", icon: "💼" },
  { id: "gifts", label: "Gifts", icon: "🎁" },
  { id: "other", label: "Other", icon: "📎" },
];

const frequencies = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "annually", label: "Annually" },
];

const QuickAddScreen = ({ navigation }) => {
  const [transactionType, setTransactionType] = useState("expense");
  const [displayValue, setDisplayValue] = useState("0");
  const [operator, setOperator] = useState(null);
  const [previousValue, setPreviousValue] = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [category, setCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState("monthly");

  const currentCategories =
    transactionType === "expense" ? expenseCategories : incomeCategories;

  useEffect(() => {
    setCategory(null); // Reset category when type changes
  }, [transactionType]);

  const handleNumberInput = (num) => {
    if (displayValue.length >= 12) return;
    if (displayValue === "0" || displayValue === "Error") {
      setDisplayValue(num.toString());
    } else {
      setDisplayValue(displayValue + num.toString());
    }
  };

  const handleOperatorInput = (op) => {
    if (displayValue === "Error") return;
    if (previousValue !== null && operator) {
      handleEquals(); // Calculate intermediate result
      setPreviousValue(parseFloat(displayValue));
    } else {
      setPreviousValue(parseFloat(displayValue));
    }
    setOperator(op);
    setDisplayValue("0");
  };

  const handleEquals = () => {
    if (!operator || previousValue === null || displayValue === "Error") return;
    const currentValue = parseFloat(displayValue);
    let result;

    switch (operator) {
      case "+":
        result = previousValue + currentValue;
        break;
      case "-":
        result = previousValue - currentValue;
        break;
      case "*":
        result = previousValue * currentValue;
        break;
      case "/":
        if (currentValue === 0) {
          result = "Error";
        } else {
          result = previousValue / currentValue;
        }
        break;
      default:
        return;
    }

    setDisplayValue(result.toString());
    setPreviousValue(null);
    setOperator(null);
  };

  const handleClear = () => {
    setDisplayValue("0");
    setPreviousValue(null);
    setOperator(null);
  };

  const handleSave = async () => {
    const amount = parseFloat(displayValue);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }
    if (!category) {
      Alert.alert(
        "Select Category",
        "Please select a category for this transaction."
      );
      return;
    }

    setIsSaving(true);
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in.");
      setIsSaving(false);
      return;
    }

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
      Alert.alert("Success!", `Your ${transactionType} has been saved.`);
      handleClear();
      setCategory(null);
      setIsRecurring(false);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not save transaction.");
    } finally {
      setIsSaving(false);
    }
  };

  const KeypadButton = ({ onPress, text, style, textStyle }) => (
    <TouchableOpacity
      style={[styles.keypadButton, style]}
      onPress={onPress}
    >
      <Text style={[styles.keypadButtonText, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              transactionType === "expense" && styles.activeTypeButton,
            ]}
            onPress={() => setTransactionType("expense")}
          >
            <Text
              style={[
                styles.typeButtonText,
                transactionType === "expense" && styles.activeTypeButtonText,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              transactionType === "income" && styles.activeTypeButton,
            ]}
            onPress={() => setTransactionType("income")}
          >
            <Text
              style={[
                styles.typeButtonText,
                transactionType === "income" && styles.activeTypeButtonText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Display */}
        <View style={styles.displayContainer}>
          <Text
            style={styles.displayText}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            ₱{displayValue}
          </Text>
        </View>

        {/* Category Selector */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {currentCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  category === cat.id && styles.activeCategoryChip,
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={styles.categoryChipText}>
                  {cat.icon} {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recurring Toggle */}
        <TouchableOpacity
          style={styles.recurringToggle}
          onPress={() => setIsRecurring(!isRecurring)}
        >
          <View style={[styles.checkbox, isRecurring && styles.checkboxActive]}>
            {isRecurring && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.recurringText}>Recurring Transaction</Text>
        </TouchableOpacity>

        {/* Recurring Frequency Selector */}
        {isRecurring && (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Frequency</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {frequencies.map((freq) => (
                <TouchableOpacity
                  key={freq.id}
                  style={[
                    styles.categoryChip,
                    recurringFrequency === freq.id && styles.activeCategoryChip,
                  ]}
                  onPress={() => setRecurringFrequency(freq.id)}
                >
                  <Text style={styles.categoryChipText}>{freq.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Keypad */}
        <View style={styles.keypad}>
          <View style={styles.keypadRow}>
            <KeypadButton
              onPress={handleClear}
              text="C"
              style={styles.utilityKey}
            />
            <KeypadButton
              onPress={() => handleOperatorInput("/")}
              text="÷"
              style={styles.operatorKey}
            />
            <KeypadButton
              onPress={() => handleOperatorInput("*")}
              text="×"
              style={styles.operatorKey}
            />
            <KeypadButton
              onPress={() => handleOperatorInput("-")}
              text="−"
              style={styles.operatorKey}
            />
          </View>
          <View style={styles.keypadRow}>
            <KeypadButton
              onPress={() => handleNumberInput(7)}
              text="7"
            />
            <KeypadButton
              onPress={() => handleNumberInput(8)}
              text="8"
            />
            <KeypadButton
              onPress={() => handleNumberInput(9)}
              text="9"
            />
            <KeypadButton
              onPress={() => handleOperatorInput("+")}
              text="+"
              style={styles.operatorKey}
            />
          </View>
          <View style={styles.keypadRow}>
            <KeypadButton
              onPress={() => handleNumberInput(4)}
              text="4"
            />
            <KeypadButton
              onPress={() => handleNumberInput(5)}
              text="5"
            />
            <KeypadButton
              onPress={() => handleNumberInput(6)}
              text="6"
            />
            <KeypadButton
              onPress={handleEquals}
              text="="
              style={styles.operatorKey}
            />
          </View>
          <View style={styles.bottomKeysContainer}>
            {/* Column for 1,2,3 and 0,. */}
            <View style={styles.numberColumn}>
              <View style={styles.keypadRow}>
                <KeypadButton
                  onPress={() => handleNumberInput(1)}
                  text="1"
                />
                <KeypadButton
                  onPress={() => handleNumberInput(2)}
                  text="2"
                />
                <KeypadButton
                  onPress={() => handleNumberInput(3)}
                  text="3"
                />
              </View>
              <View
                style={[styles.keypadRow, { justifyContent: "flex-start" }]}
              >
                <KeypadButton
                  onPress={() => handleNumberInput(0)}
                  text="0"
                  style={styles.zeroKey}
                />
                <KeypadButton
                  onPress={() => handleNumberInput(".")}
                  text="."
                  style={{ marginLeft: 10 }}
                />
              </View>
            </View>
            {/* Enter button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor:
                    transactionType === "expense" ? "#e53e3e" : "#27ae60",
                },
              ]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Enter</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <BottomNav />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a202c" },
  content: { flex: 1, justifyContent: "flex-end", padding: 15 },
  typeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#2d3748",
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 21,
  },
  activeTypeButton: {
    backgroundColor: "#4a5568",
  },
  typeButtonText: {
    color: "#a0aec0",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  activeTypeButtonText: {
    color: "#fff",
  },
  displayContainer: {
    marginBottom: 20,
    paddingRight: 20,
    minHeight: 80,
    justifyContent: "center",
  },
  displayText: {
    color: "#fff",
    fontSize: 64,
    textAlign: "right",
    fontWeight: "300",
  },
  categorySection: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: "#a0aec0",
    fontSize: 14,
    marginBottom: 10,
  },
  categoryChip: {
    backgroundColor: "#2d3748",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  activeCategoryChip: {
    backgroundColor: "#667eea",
  },
  categoryChipText: {
    color: "#fff",
    fontSize: 14,
  },
  recurringToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#a0aec0",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
  },
  recurringText: {
    color: "#e2e8f0",
    fontSize: 16,
  },
  keypad: {
    marginBottom: 15,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  keypadButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "#2d3748",
    justifyContent: "center",
    alignItems: "center",
  },
  keypadButtonText: {
    color: "#fff",
    fontSize: 32,
  },
  utilityKey: {
    backgroundColor: "#4a5568",
  },
  operatorKey: {
    backgroundColor: "#f6ad55",
  },
  zeroKey: {
    width: 160, // Double width
  },
  bottomKeysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  numberColumn: {
    // Takes up the space of 3 columns
    width: 75 * 3 + 10 * 2,
  },
  saveButton: {
    width: 75,
    height: 160, // Spans two rows (75 + 10 + 75)
    borderRadius: 37.5,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default QuickAddScreen;
