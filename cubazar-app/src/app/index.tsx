import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import LoginView from "../views/loginView";
import { useEffect } from "react";

export default function MainScreen() {
  const { isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) console.info("[STARTUP-DIAG][index] route-level loading gate active");
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <View style={{ flex: 1 }}>
      <LoginView />
    </View>
  );
}
