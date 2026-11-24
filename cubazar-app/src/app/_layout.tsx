import {
  DarkTheme,
  Redirect,
  Slot,
  ThemeProvider,
  useSegments,
} from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { colors } from "@/constants/theme";

let nextRootLayoutInstanceId = 0;

function startupErrorType(reason: unknown): string {
  return reason instanceof Error ? reason.name : typeof reason;
}

// Previene que el splash screen se oculte automáticamente
console.info("[STARTUP-DIAG][splash] prevent-auto-hide requested");
void SplashScreen.preventAutoHideAsync()
  .then(() => console.info("[STARTUP-DIAG][splash] prevent-auto-hide completed"))
  .catch((reason) => {
    console.warn(`[STARTUP-DIAG][splash] prevent-auto-hide failed; error=${startupErrorType(reason)}`);
  });

function RootNavigator() {
  const { isLoading, token } = useAuth();
  const segments = useSegments();
  const isLoginRoute =
    segments.join("/") === "" || (segments.length === 1 && segments[0] === "login");
  const routeGroup = segments[0] === "(tabs)" ? "tabs" : "other";

  useEffect(() => {
    console.info(
      `[STARTUP-DIAG][navigator] guard state; isLoading=${isLoading} tokenPresent=${Boolean(token)} routeGroup=${routeGroup} loginRoute=${isLoginRoute}`,
    );
  }, [isLoading, isLoginRoute, routeGroup, token]);

  useEffect(() => {
    if (isLoading) {
      console.info("[STARTUP-DIAG][splash] hide skipped; auth is still loading");
      return;
    }

    try {
      console.info("[STARTUP-DIAG][splash] hide invoked");
      SplashScreen.hide();
      console.info("[STARTUP-DIAG][splash] hide returned");
    } catch (reason) {
      console.warn(`[STARTUP-DIAG][splash] hide failed; error=${startupErrorType(reason)}`);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.text }}>Preparando tu sesión...</Text>
      </View>
    );
  }
  if (!token && !isLoginRoute) return <Redirect href="/" />;
  if (token && isLoginRoute) return <Redirect href="/(tabs)" />;

  return <Slot />;
}

export default function RootLayout() {
  const rootLayoutInstanceIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (rootLayoutInstanceIdRef.current === null) {
      rootLayoutInstanceIdRef.current = ++nextRootLayoutInstanceId;
    }
    const rootLayoutId = rootLayoutInstanceIdRef.current;
    console.info(`[STARTUP-DIAG][layout] RootLayout mounted id=${rootLayoutId}`);
    return () => {
      console.info(`[STARTUP-DIAG][layout] RootLayout unmounted id=${rootLayoutId}`);
    };
  }, []);

  return (
    <ThemeProvider value={DarkTheme}>
      <StatusBar style="light" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
