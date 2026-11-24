import { Alert, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { colors } from "@/constants/theme";

export default function MenuDrawer({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { signOut } = useAuth();

  const navigate = (path: "/" | "/(tabs)/cuenta" | "/mis-publicaciones" | "/acerca-de") => {
    onClose();
    router.push(path);
  };

  const rows = [
    { icon: "person-outline", label: "Mi perfil", path: "/(tabs)/cuenta" as const },
    { icon: "albums-outline", label: "Mis publicaciones y ventas", path: "/mis-publicaciones" as const },
    { icon: "settings-outline", label: "Configuración", path: "/(tabs)/cuenta" as const },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.45)" }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
          onPress={onClose}
          style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
        />
        <SafeAreaView
          edges={["top", "bottom", "left"]}
          style={{ width: "82%", maxWidth: 340, height: "100%", backgroundColor: colors.bg, paddingHorizontal: 16 }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>CuBazar</Text>
            <TouchableOpacity
              onPress={onClose}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
              accessibilityRole="button"
              accessibilityLabel="Cerrar menú"
            >
              <Icon name="close" type="ionicon" color={colors.text} />
            </TouchableOpacity>
          </View>
          {rows.map((row) => (
            <TouchableOpacity
              key={row.label}
              style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 }}
              onPress={() => navigate(row.path)}
            >
              <Icon name={row.icon} type="ionicon" color={colors.primary} size={22} />
              <Text style={{ color: colors.text, fontSize: 15 }}>{row.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, marginTop: 8 }}
            onPress={async () => {
              onClose();
              try {
                await signOut();
                router.replace("/login");
              } catch (reason) {
                Alert.alert(
                  "No se pudo cerrar sesión",
                  reason instanceof Error ? reason.message : "Intenta de nuevo.",
                );
              }
            }}
          >
            <Icon name="log-out-outline" type="ionicon" color={colors.danger} size={22} />
            <Text style={{ color: colors.danger, fontSize: 15, fontWeight: "700" }}>Cerrar sesión</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
