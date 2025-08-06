import { registerRootComponent } from "expo";

import App from "./App";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "./src/screens/SplashScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import SetupProfileScreen from "./src/screens/SetupProfileScreen";
import HomeScreen from "./src/screens/HomeScreen";
const Stack = createNativeStackNavigator();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
