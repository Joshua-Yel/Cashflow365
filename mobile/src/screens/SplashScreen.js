import React, { useEffect } from "react";
import { View, Text, StyleSheet, StatusBar, Animated } from "react-native";

const SplashScreen = () => {
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Status bar */}
      <StatusBar barStyle="light-content" />

      <View style={styles.contentContainer}>
        {/* <Text style={styles.icon}>💰</Text> */}
        <Text style={styles.title}>CASHFLOW365</Text>
        <Text style={styles.subtitle}>Alamin ang inyong financial future</Text>
        <Text style={styles.subtitleSecondary}>Know your financial future</Text>

        {/* Animated Loader */}
        <Animated.View
          style={[styles.loader, { transform: [{ rotate: spin }] }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2980b9",
  },
  statusBarContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    zIndex: 1,
  },
  statusBarText: {
    color: "white",
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2980b9",
    paddingHorizontal: 100,
  },
  icon: {
    fontSize: 48,
    marginBottom: 20,
    color: "white",
  },
  title: {
    fontSize: 28,
    marginBottom: 10,
    color: "white",
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    opacity: 0.9,
    color: "white",
  },
  subtitleSecondary: {
    textAlign: "center",
    opacity: 0.7,
    fontSize: 14,
    color: "white",
  },
  loader: {
    marginTop: 40,
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: "white",
    borderTopColor: "transparent",
    borderRadius: 20,
    animation: "spin 1s linear infinite",
  },
});

export default SplashScreen;
