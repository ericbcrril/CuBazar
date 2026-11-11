import { useState } from "react";
import { Text, View } from "react-native";
import { Button, Image, Input } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";

//Styles
import styles from "@/styles/loginView";

//Images
const logoImg = require("../assets/images/download.jpg");

export default function LoginView() {
  const [loginView, setLoginView] = useState(0); // 0: login form, 1: register form

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <Image source={logoImg} resizeMode="contain" />
        <Input
          placeholder="example@correo.com"
          label="Correo electrónico UDG"
          containerStyle={styles.containerStyle}
          inputContainerStyle={styles.inputContainerStyle}
          disabledInputStyle={styles.disabledInputStyle}
          labelStyle={styles.labelStyle}
          inputStyle={styles.inputStyle}
        />
        <Input
          placeholder="password"
          label="Contraseña"
          containerStyle={styles.containerStyle}
          inputContainerStyle={styles.inputContainerStyle}
          disabledInputStyle={styles.disabledInputStyle}
          labelStyle={styles.labelStyle}
          inputStyle={styles.inputStyle}
        />
        <Button onPressOut={() => alert("login")} title="Iniciar Session" />
        <Button onPressOut={() => alert("login")} title="Iniciar con Google" />
        <Text>¿No tienes cuenta aún? Registrate aqui</Text>
      </SafeAreaView>
    </View>
  );
}
