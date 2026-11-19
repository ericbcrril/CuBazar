import { Button, Icon, Input, Switch, Text } from "@rneui/themed";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import styles from "@/styles/loginView";

export default function LoginScreen() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Formulario de registro
  function RegisterForm() {
    return (
      <View style={styles.formContainer}>
        {/* Correo electrónico */}
        <Text style={styles.inputLabel}>Correo electronico UDG</Text>
        <Input
          placeholder="correo@alumnos.udg.mx"
          placeholderTextColor="#B0B2B8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.inputOuterContainer}
          inputContainerStyle={styles.inputInnerContainer}
          inputStyle={styles.inputText}
          leftIcon={
            <Icon name="email" type="material" color="#DEC2C6" size={22} />
          }
          leftIconContainerStyle={styles.leftIconContainer}
          renderErrorMessage={false}
        />
        {/* Contraseña */}
        <Text style={[styles.inputLabel, styles.passwordLabelSpacing]}>
          Contraseña
        </Text>
        <Input
          placeholder="******************"
          placeholderTextColor="#B0B2B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          containerStyle={styles.inputOuterContainer}
          inputContainerStyle={styles.inputInnerContainer}
          inputStyle={styles.inputText}
          leftIcon={
            <Icon name="lock" type="material" color="#DEC2C6" size={22} />
          }
          leftIconContainerStyle={styles.leftIconContainer}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? "visibility" : "visibility-off"}
                type="material-icons"
                color="#DEC2C6"
                size={22}
              />
            </TouchableOpacity>
          }
          rightIconContainerStyle={styles.rightIconContainer}
          renderErrorMessage={false}
        />
        {/* Confirmar contraseña */}
        <Text style={[styles.inputLabel, styles.passwordLabelSpacing]}>
          Confirmar Contraseña
        </Text>
        <Input
          placeholder="******************"
          placeholderTextColor="#B0B2B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          containerStyle={styles.inputOuterContainer}
          inputContainerStyle={styles.inputInnerContainer}
          inputStyle={styles.inputText}
          leftIcon={
            <Icon name="lock" type="material" color="#DEC2C6" size={22} />
          }
          leftIconContainerStyle={styles.leftIconContainer}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? "visibility" : "visibility-off"}
                type="material-icons"
                color="#DEC2C6"
                size={22}
              />
            </TouchableOpacity>
          }
          rightIconContainerStyle={styles.rightIconContainer}
          renderErrorMessage={false}
        />
        {/* Botón de registro */}
        <Button
          title="Registrarse"
          buttonStyle={styles.primaryButton}
          titleStyle={styles.primaryButtonText}
          containerStyle={styles.buttonWrapper}
          onPress={() => console.log("Register:", { email, password })}
        />
        <Button
          title="Iniciar con Google"
          buttonStyle={styles.googleButton}
          titleStyle={styles.googleButtonText}
          containerStyle={styles.buttonWrapper}
          icon={
            <Icon
              name="google"
              type="font-awesome"
              color="#FFFFFF"
              size={20}
              style={styles.googleIcon}
            />
          }
          onPress={() => console.log("Google Login")}
        />
      </View>
    );
  }

  function LoginForm() {
    return (
      <View style={styles.formContainer}>
        <Text style={styles.inputLabel}>Correo electronico UDG</Text>
        <Input
          placeholder="Correo Electrónico"
          placeholderTextColor="#B0B2B8"
          value={email}
          onChangeText={setEmail}
          containerStyle={styles.inputOuterContainer}
          inputContainerStyle={styles.inputInnerContainer}
          inputStyle={styles.inputText}
          leftIcon={
            <Icon name="email" type="material" color="#DEC2C6" size={22} />
          }
          leftIconContainerStyle={styles.leftIconContainer}
          renderErrorMessage={false}
        />
        <Text style={[styles.inputLabel, styles.passwordLabelSpacing]}>
          Contraseña
        </Text>
        <Input
          placeholder="Contraseña"
          placeholderTextColor="#B0B2B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          containerStyle={styles.inputOuterContainer}
          inputContainerStyle={styles.inputInnerContainer}
          inputStyle={styles.inputText}
          leftIcon={
            <Icon name="lock" type="material" color="#DEC2C6" size={22} />
          }
          leftIconContainerStyle={styles.leftIconContainer}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? "visibility" : "visibility-off"}
                type="material-icons"
                color="#DEC2C6"
                size={22}
              />
            </TouchableOpacity>
          }
          rightIconContainerStyle={styles.rightIconContainer}
          renderErrorMessage={false}
        />
        <Button
          title="Iniciar Sesión"
          buttonStyle={styles.primaryButton}
          titleStyle={styles.primaryButtonText}
          containerStyle={styles.buttonWrapper}
          onPress={() => console.log("Login:", { email, password })}
        />
        <Button
          title="Iniciar con Google"
          buttonStyle={styles.googleButton}
          titleStyle={styles.googleButtonText}
          containerStyle={styles.buttonWrapper}
          icon={
            <Icon
              name="google"
              type="font-awesome"
              color="#FFFFFF"
              size={20}
              style={styles.googleIcon}
            />
          }
          onPress={() => console.log("Google Login")}
        />
        <Text style={styles.inputLabel}>
          ¿No tienes cuenta aun?,{" "}
          <TouchableOpacity onPress={() => setActiveTab("register")}>
            <Text style={styles.inputLabel}>Registrate aquí</Text>
          </TouchableOpacity>{" "}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.flex, { backgroundColor: "#16171C" }]}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Switch superior derecho */}
          <View style={styles.topBar}>
            <View style={styles.customSwitchWrapper}>
              <Switch
                value={isDarkTheme}
                onValueChange={setIsDarkTheme}
                color="#26282E"
                thumbColor="#DEC2C6"
                trackColor={{ false: "#3A3C42", true: "#26282E" }}
              />
            </View>
          </View>

          {/* Logo CU-bazar */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>CU</Text>
            <View style={styles.logoAccentWrapper}>
              <View style={styles.logoCheckRed} />
              <View style={styles.logoCheckWhite} />
            </View>
            <Text style={styles.logoText}>bazar</Text>
          </View>

          {/* Selector de pestañas (Iniciar Sesión / Crear Cuenta) */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "login" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("login")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "login"
                    ? styles.activeTabText
                    : styles.inactiveTabText,
                ]}
              >
                Iniciar Sesión
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "register" && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab("register")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "register"
                    ? styles.activeTabText
                    : styles.inactiveTabText,
                ]}
              >
                Crear Cuenta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Formulario */}
          {activeTab === "login" ? <LoginForm /> : <RegisterForm />}

          {/* Footer */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>¿No tienes cuenta aún? </Text>
            <TouchableOpacity onPress={() => setActiveTab("register")}>
              <Text style={styles.registerLinkText}>Registrate aquí</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
