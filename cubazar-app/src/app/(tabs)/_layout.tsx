import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/constants/theme";

// Barra inferior: Inicio · Explorar · (Publicar) · Actividad · Cuenta
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="home-outline" size={size} color={focused ? colors.primary : colors.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="explorar"
        options={{
          title: "Explorar",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="storefront-outline" size={size} color={focused ? colors.primary : colors.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="publicar"
        options={{
          title: "",
          tabBarIcon: () => (
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginTop: -8 }}>
              <Ionicons name="add" size={28} color={colors.text} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="actividad"
        options={{
          title: "Actividad",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="swap-horizontal-outline" size={size} color={focused ? colors.primary : colors.muted} />
          ),
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: "Cuenta",
          tabBarIcon: ({ focused, size }) => (
            <Ionicons name="person-outline" size={size} color={focused ? colors.primary : colors.muted} />
          ),
        }}
      />
    </Tabs>
  );
}
