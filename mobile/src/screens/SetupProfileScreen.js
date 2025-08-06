import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import { ref, set } from "firebase/database";

const SetupProfileScreen = () => {
  const [name, setName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [payday, setPayday] = useState("");
  const [familySize, setFamilySize] = useState("");
  const [language, setLanguage] = useState("EN");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  // Handle profile setup data
  const handleProfileSetup = async () => {
    if (!name || !monthlyIncome || !payday || !familySize) {
      Alert.alert("Please fill in all fields.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert(
        "Authentication Error",
        "You need to be logged in to set up a profile."
      );
      return;
    }

    setLoading(true);

    const profileData = {
      name,
      monthlyIncome: parseFloat(monthlyIncome),
      payday,
      familySize: parseInt(familySize, 10),
      language,
      createdAt: new Date().toISOString(),
    };

    try {
      const userProfileRef = ref(db, `users/${user.uid}/profile`);
      await set(userProfileRef, profileData);

      console.log("Profile Saved to Firebase:", profileData);

      // Alert user and navigate to Home screen
      Alert.alert("Profile setup complete!");
      navigation.replace("HomeScreen"); // Use replace to prevent going back to setup
    } catch (error) {
      console.error("Firebase Write Error:", error);
      Alert.alert(
        "Error",
        "There was an issue saving your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "EN" ? "FIL" : "EN");
  };

  return (
    <View style={styles.container}>
      {/* Status Bar */}
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.screenHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>
          {language === "EN" ? "Setup Profile" : "I-setup ang Profile"}
        </Text>
        <TouchableOpacity
          style={styles.languageToggle}
          onPress={toggleLanguage}
        >
          <Text style={styles.languageText}>{language}</Text>
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <View style={styles.screenContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {language === "EN" ? "Name" : "Pangalan"}
          </Text>
          <TextInput
            style={styles.inputField}
            placeholder={
              language === "EN" ? "Juan Dela Cruz" : "Juan Dela Cruz"
            }
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {language === "EN" ? "Monthly Income" : "Buwanang Kita"}
          </Text>
          <TextInput
            style={styles.inputField}
            placeholder="₱25,000"
            keyboardType="numeric"
            value={monthlyIncome}
            onChangeText={setMonthlyIncome}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {language === "EN" ? "Payday" : "Araw ng Sahod"}
          </Text>
          <TextInput
            style={styles.inputField}
            placeholder={
              language === "EN"
                ? "15th and 30th of the month"
                : "15th at 30th ng buwan"
            }
            value={payday}
            onChangeText={setPayday}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {language === "EN" ? "Family Size" : "Bilang ng Pamilya"}
          </Text>
          <TextInput
            style={styles.inputField}
            placeholder="4"
            keyboardType="numeric"
            value={familySize}
            onChangeText={setFamilySize}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>
            {language === "EN"
              ? "🔒 All your information is secure and private."
              : "🔒 Ang lahat ng inyong information ay secure at private."}
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleProfileSetup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>
              {language === "EN" ? "Continue" : "Magpatuloy"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  statusBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statusText: {
    color: "#777",
    fontSize: 12,
  },
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: "#333",
    fontWeight: "bold",
  },
  screenTitle: {
    fontSize: 24,
    color: "#333",
    textAlign: "center",
    fontWeight: "bold",
    flex: 1,
  },
  languageToggle: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 20,
    minWidth: 40,
    alignItems: "center",
  },
  languageText: {
    fontSize: 14,
    color: "#333",
  },
  screenContent: {
    marginTop: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  inputField: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 16,
  },
  card: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 30,
    alignItems: "center",
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SetupProfileScreen;
