import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { auth, db } from "./src/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";

import SplashScreen from "./src/screens/SplashScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import SetupProfileScreen from "./src/screens/SetupProfileScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ExpenseInputScreen from "./src/screens/ExpenseInputScreen";
import IncomeInputScreen from "./src/screens/IncomeInputScreen";
import PredictionScreen from "./src/screens/PredictionsScreen";
import ExpensesListScreen from "./src/screens/ExpensesListScreen";
import Login from "./src/components/authentication/login";
import Registration from "./src/components/authentication/registration";
import DetailedAnalysisScreen from "./src/screens/DetailedAnalysisScreen";
import BudgetPlannerScreen from "./src/screens/BudgetPlannerScreen";
import SavingsGoalsScreen from "./src/screens/SavingsGoalsScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import QuickAddScreen from "./src/screens/QuickAddScreen";

// Create the Stack Navigator
const Stack = createNativeStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    // Handle user state changes
    const authSubscriber = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        // If user is null, we are done initializing.
        setInitializing(false);
        setProfileExists(false);
      }
    });

    return authSubscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    // If we have a user, check for their profile
    const profileRef = ref(db, `users/${user.uid}/profile`);
    const profileSubscriber = onValue(
      profileRef,
      (snapshot) => {
        setProfileExists(snapshot.exists() && snapshot.val().name);
        if (initializing) {
          setInitializing(false);
        }
      },
      (error) => {
        console.error("Firebase profile listener error:", error);
        setProfileExists(false);
        if (initializing) {
          setInitializing(false);
        }
      }
    );

    return profileSubscriber; // unsubscribe on unmount
  }, [user]);

  if (initializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#2c3e50"
        />
      </View>
    );
  }

  const commonScreenOptions = {
    headerShown: false,
    gestureEnabled: false,
    animation: "fade_from_bottom",
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen
              name="LoginScreen"
              component={Login}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="RegistrationScreen"
              component={Registration}
              options={commonScreenOptions}
            />
          </>
        ) : !profileExists ? (
          <>
            <Stack.Screen
              name="OnboardingScreen"
              component={OnboardingScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="SetupProfileScreen"
              component={SetupProfileScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="HomeScreen"
              component={HomeScreen}
              options={commonScreenOptions}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="HomeScreen"
              component={HomeScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="ExpenseInputScreen"
              component={ExpenseInputScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="IncomeInputScreen"
              component={IncomeInputScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="PredictionScreen"
              component={PredictionScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="ExpensesListScreen"
              component={ExpensesListScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="LoginScreen"
              component={Login}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="RegistrationScreen"
              component={Registration}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="DetailedAnalysisScreen"
              component={DetailedAnalysisScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="BudgetPlannerScreen"
              component={BudgetPlannerScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="SavingsGoalsScreen"
              component={SavingsGoalsScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="ProfileScreen"
              component={ProfileScreen}
              options={commonScreenOptions}
            />
            <Stack.Screen
              name="QuickAddScreen"
              component={QuickAddScreen}
              options={{
                ...commonScreenOptions,
                animation: "slide_from_bottom",
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
