import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

//Views
import LoginView from "../views/loginView";
import MainApp from "../views/mainApp";

export default function MainScreen() {
  const [isLogged, setIsLogged] = useState(false);
  const [loginView, setLoginView] = useState(0); // 0: login form, 1: register form

  return (
    <View>
      <SafeAreaView>{isLogged ? <MainApp /> : <LoginView />}</SafeAreaView>
    </View>
  );
}
