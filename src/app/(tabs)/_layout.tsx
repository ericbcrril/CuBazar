import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/constants/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color }: { color: string }) => <Ionicons name={icon} size={22} color={color} />,
});

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
      <Tabs.Screen name="index" options={tab("Inicio", "home-outline")} />
      <Tabs.Screen name="explorar" options={tab("Explorar", "storefront-outline")} />
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
      <Tabs.Screen name="actividad" options={tab("Actividad", "swap-horizontal-outline")} />
      <Tabs.Screen name="cuenta" options={tab("Cuenta", "person-outline")} />
    </Tabs>
  );
}
