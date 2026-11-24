import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import MenuRow from "@/components/MenuRow";
import MenuDrawer from "@/components/MenuDrawer";
import UserAvatar from "@/components/UserAvatar";
import NotificationBell from "@/components/NotificationBell";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getMyProfile, updateAvailability } from "@/services/users";
import { common } from "@/styles/common";
import styles from "@/styles/accountView";

export default function AccountView() {
  const router = useRouter();
  const { user, signOut, error } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    let active = true;
    getMyProfile()
      .then((profile) => {
        if (active) setIsAvailable(profile.isAvailable);
      })
      .catch((reason: unknown) => {
        if (active) setAvailabilityError(reason instanceof Error ? reason.message : "No se pudo cargar tu disponibilidad.");
      })
      .finally(() => {
        if (active) setAvailabilityLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const changeAvailability = async (value: boolean) => {
    setAvailabilityError("");
    setAvailabilitySaving(true);
    try {
      const result = await updateAvailability(value);
      setIsAvailable(result.isAvailable);
    } catch (reason) {
      setAvailabilityError(reason instanceof Error ? reason.message : "No se pudo actualizar tu disponibilidad.");
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const retryAvailability = () => {
    setAvailabilityLoading(true);
    setAvailabilityError("");
    void getMyProfile()
      .then((profile) => setIsAvailable(profile.isAvailable))
      .catch((reason: unknown) =>
        setAvailabilityError(reason instanceof Error ? reason.message : "No se pudo cargar tu disponibilidad."),
      )
      .finally(() => setAvailabilityLoading(false));
  };

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <AppHeader
        title="Cuenta"
        left={
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={{ width: 44, height: 44, alignItems: "flex-start", justifyContent: "center" }}
            accessibilityRole="button"
            accessibilityLabel="Abrir menú"
          >
            <Icon name="menu" type="ionicon" color={colors.text} />
          </TouchableOpacity>
        }
        right={
          <>
            <TouchableOpacity onPress={() => router.push("/chats")} style={{ width: 40, height: 44, alignItems: "center", justifyContent: "center" }} accessibilityRole="button" accessibilityLabel="Abrir chats">
              <Icon name="chatbubble-outline" type="ionicon" color={colors.text} />
            </TouchableOpacity>
            <NotificationBell />
          </>
        }
      />
      <MenuDrawer visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <ScrollView contentContainerStyle={common.scroll}>
        <View style={styles.profile}>
          <View style={{ width: 110, height: 110, borderRadius: 55, overflow: "hidden" }}>
            <UserAvatar uri={user?.profilePictureUrl} size={110} />
          </View>
          <Text style={styles.name}>{user?.fullName ?? "Cuenta"}</Text>
          <Text style={styles.email}>{user?.email ?? ""}</Text>
        </View>
        {error ? <Text style={[common.muted, { textAlign: "center" }]}>{error}</Text> : null}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Disponible para vender</Text>
            <Text style={styles.email}>Tus publicaciones aparecerán en el catálogo cuando estés disponible.</Text>
          </View>
          {availabilityLoading ? (
            <ActivityIndicator />
          ) : (
            <Switch
              value={isAvailable}
              disabled={availabilitySaving}
              onValueChange={(value) => void changeAvailability(value)}
            />
          )}
        </View>
        {availabilityError ? (
          <View style={{ alignItems: "center", marginBottom: 8 }}>
            <Text accessibilityRole="alert" style={[common.muted, { textAlign: "center" }]}>{availabilityError}</Text>
            <TouchableOpacity
              onPress={retryAvailability}
              style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 16 }}
              accessibilityRole="button"
            >
              <Text style={{ color: colors.accent, fontWeight: "700" }}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        <MenuRow icon="bag-handle-outline" label="Mis compras" onPress={() => router.push("/mis-compras")} />
        <MenuRow icon="albums-outline" label="Mis publicaciones" onPress={() => router.push("/mis-publicaciones")} />
        <MenuRow icon="information-circle-outline" label="Acerca de CuBazar" onPress={() => router.push("/acerca-de")} />
        <MenuRow
          icon="log-out-outline"
          label="Cerrar sesión"
          onPress={() =>
            Alert.alert("Cerrar sesión", "¿Quieres cerrar tu sesión?", [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Cerrar sesión",
                style: "destructive",
                onPress: () => {
                  void signOut()
                    .catch((reason: unknown) =>
                      Alert.alert("No se pudo cerrar sesión", reason instanceof Error ? reason.message : "Intenta de nuevo."),
                    );
                },
              },
            ])
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
