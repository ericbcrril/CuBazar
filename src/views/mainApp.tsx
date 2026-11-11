import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginView() {
  const [loginView, setLoginView] = useState(0); // 0: login form, 1: register form

  return (
    <View>
      <SafeAreaView>
        <Text>home</Text>
      </SafeAreaView>
    </View>
  );
}
