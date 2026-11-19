import { useState } from "react";
import { View } from "react-native";

//Views
import LoginView from "../views/loginView";
import MainApp from "../views/mainApp";

export default function MainScreen() {
  const [isLogged, setIsLogged] = useState(false);
  const [loginView, setLoginView] = useState(0); // 0: login form, 1: register form

  return (
    <View style={{ flex: 1 }}>
      {isLogged ? <MainApp /> : <LoginView />}
    </View>
  );
}
