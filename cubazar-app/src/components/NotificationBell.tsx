import { useCallback, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { useFocusEffect, useRouter } from "expo-router";

import { colors } from "@/constants/theme";
import { hasUnreadNotifications } from "@/services/notifications";

export default function NotificationBell() {
  const router = useRouter();
  const [unread, setUnread] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    void hasUnreadNotifications()
      .then((value) => { if (active) setUnread(value); })
      .catch((reason: unknown) => {
        if (active) {
          console.warn(
            "No se pudo consultar el estado de las notificaciones.",
            reason instanceof Error ? reason.message : reason,
          );
        }
      });
    return () => { active = false; };
  }, []));

  return (
    <TouchableOpacity
      onPress={() => router.push("/notificaciones")}
      style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
      accessibilityRole="button"
      accessibilityLabel={unread ? "Notificaciones sin leer" : "Notificaciones"}
    >
      <Icon name={unread ? "notifications" : "notifications-outline"} type="ionicon" color={unread ? colors.primary : colors.text} />
      {unread ? (
        <View style={{ position: "absolute", top: 7, right: 7, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.danger, borderWidth: 1, borderColor: colors.bg }} />
      ) : null}
    </TouchableOpacity>
  );
}
