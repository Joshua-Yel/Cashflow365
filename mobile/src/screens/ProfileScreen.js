import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../firebaseConfig";
import { ref, onValue } from "firebase/database";

const ProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [language, setLanguage] = useState("EN");

  const texts = {
    EN: {
      title: "My Profile",
      name: "Name",
      monthlyIncome: "Monthly Income",
      payday: "Payday",
      familySize: "Family Size",
      logout: "Logout",
      logoutConfirmTitle: "Confirm Logout",
      logoutConfirmMessage: "Are you sure you want to log out?",
      cancel: "Cancel",
      noProfile: "Profile not found. Please set it up.",
    },
    FIL: {
      title: "Aking Profile",
      name: "Pangalan",
      monthlyIncome: "Buwanang Kita",
      payday: "Araw ng Sahod",
      familySize: "Bilang ng Pamilya",
      logout: "Mag-logout",
      logoutConfirmTitle: "Kumpirmahin ang Pag-logout",
      logoutConfirmMessage: "Sigurado ka bang gusto mong mag-logout?",
      cancel: "Kanselahin",
      noProfile: "Hindi mahanap ang profile. Paki-setup.",
    },
  };

  const currentTexts = texts[language];

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const profileRef = ref(db, `users/${user.uid}/profile`);
    const unsubscribe = onValue(profileRef, (snapshot) => {
      const data = snapshot.val();
      setProfile(data);
      if (data?.language) {
        setLanguage(data.language);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      currentTexts.logoutConfirmTitle,
      currentTexts.logoutConfirmMessage,
      [
        { text: currentTexts.cancel, style: "cancel" },
        {
          text: currentTexts.logout,
          style: "destructive",
          onPress: () => {
            auth.signOut().catch((error) => {
              console.error("Logout Error:", error);
              Alert.alert("Error", "Could not log out.");
            });
            // The onAuthStateChanged listener in App.js will handle navigation
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator
          size="large"
          color="#667eea"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{currentTexts.title}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {profile ? (
          <>
            <View style={styles.profileCard}>
              <View style={styles.profileIconContainer}>
                <Text style={styles.profileIcon}>👤</Text>
              </View>
              <Text style={styles.profileName}>{profile.name}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {currentTexts.monthlyIncome}:
                </Text>
                <Text style={styles.infoValue}>
                  ₱{profile.monthlyIncome?.toLocaleString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{currentTexts.payday}:</Text>
                <Text style={styles.infoValue}>{profile.payday}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{currentTexts.familySize}:</Text>
                <Text style={styles.infoValue}>{profile.familySize}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.centered}>
            <Text>{currentTexts.noProfile}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>{currentTexts.logout}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 24, color: "#ffffff", fontWeight: "bold" },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginRight: 40,
  },
  content: { padding: 20 },
  profileCard: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileIcon: {
    fontSize: 50,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
