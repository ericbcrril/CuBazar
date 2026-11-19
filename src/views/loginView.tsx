import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Button, Icon, Image, Input } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

//Styles
import styles from "@/styles/loginView";
import { btn } from "@/styles/common";
import { colors } from "@/constants/theme";

//Images
const logoImg = require("../assets/images/download.jpg");

// Solo correos institucionales de la UDG
const CORREO_UDG = /^[^\s@]+@alumnos\.udg\.mx$/i;

export default function LoginView() {
  const router = useRouter();
  const [registro, setRegistro] = useState(false); // false: iniciar sesión, true: crear cuenta
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState("");

  const enviar = () => {
    if (registro && !nombre.trim()) return setError("Escribe tu nombre.");
    if (!CORREO_UDG.test(correo.trim())) return setError("Usa tu correo institucional (@alumnos.udg.mx).");
    if (password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (registro && password !== confirmar) return setError("Las contraseñas no coinciden.");
    setError("");
    // TODO: llamar a tu API (POST /auth/login o /auth/register) y guardar el JWT
    router.replace("/(tabs)");
  };

  const ojo = (
    <TouchableOpacity onPress={() => setVerPassword((v) => !v)}>
      <Icon name={verPassword ? "eye-off-outline" : "eye-outline"} type="ionicon" color={colors.muted} size={18} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Image source={logoImg} resizeMode="contain" style={styles.logo} />

            <View style={styles.tabs}>
              {[false, true].map((esRegistro) => (
                <TouchableOpacity
                  key={String(esRegistro)}
                  style={[styles.tab, registro === esRegistro && styles.tabActive]}
                  onPress={() => {
                    setRegistro(esRegistro);
                    setError("");
                  }}
                >
                  <Text style={[styles.tabText, registro === esRegistro && styles.tabTextActive]}>
                    {esRegistro ? "Crear Cuenta" : "Iniciar Sesión"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {registro && (
              <Input
                label="Nombre"
                placeholder="Tu nombre"
                value={nombre}
                onChangeText={setNombre}
                containerStyle={styles.containerStyle}
                inputContainerStyle={styles.inputContainerStyle}
                disabledInputStyle={styles.disabledInputStyle}
                labelStyle={styles.labelStyle}
                inputStyle={styles.inputStyle}
              />
            )}
            <Input
              label="Correo electrónico UDG"
              placeholder="correo@alumnos.udg.mx"
              value={correo}
              onChangeText={setCorreo}
              autoCapitalize="none"
              keyboardType="email-address"
              containerStyle={styles.containerStyle}
              inputContainerStyle={styles.inputContainerStyle}
              disabledInputStyle={styles.disabledInputStyle}
              labelStyle={styles.labelStyle}
              inputStyle={styles.inputStyle}
            />
            <Input
              label={registro ? "Introduce tu contraseña" : "Contraseña"}
              placeholder="********"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!verPassword}
              rightIcon={ojo}
              containerStyle={styles.containerStyle}
              inputContainerStyle={styles.inputContainerStyle}
              disabledInputStyle={styles.disabledInputStyle}
              labelStyle={styles.labelStyle}
              inputStyle={styles.inputStyle}
            />
            {registro && (
              <Input
                label="Confirma tu contraseña"
                placeholder="********"
                value={confirmar}
                onChangeText={setConfirmar}
                secureTextEntry={!verPassword}
                containerStyle={styles.containerStyle}
                inputContainerStyle={styles.inputContainerStyle}
                disabledInputStyle={styles.disabledInputStyle}
                labelStyle={styles.labelStyle}
                inputStyle={styles.inputStyle}
              />
            )}

            {!registro && (
              <Text style={styles.forgot} onPress={() => alert("Recuperar contraseña")}>
                ¿Olvidaste tu contraseña?
              </Text>
            )}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              title={registro ? "Crear Cuenta" : "Iniciar Sesión"}
              onPress={enviar}
              containerStyle={btn.container}
              buttonStyle={btn.primary}
              titleStyle={btn.title}
            />
            <Button
              title="Iniciar con Google"
              onPress={() => alert("Google Sign-In")}
              icon={{ name: "logo-google", type: "ionicon", color: colors.text, size: 16 }}
              containerStyle={btn.container}
              buttonStyle={btn.secondary}
              titleStyle={btn.title}
            />

            <Text style={styles.footerText}>
              {registro ? "¿Ya tienes cuenta? " : "¿No tienes cuenta aún? "}
              <Text style={styles.link} onPress={() => setRegistro(!registro)}>
                {registro ? "Inicia sesión" : "Regístrate aquí"}
              </Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
