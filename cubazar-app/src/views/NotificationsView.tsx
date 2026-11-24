import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import { getActivity } from "@/services/users";
import type { ApiActivity } from "@/types/api";
import { colors } from "@/constants/theme";
import { common } from "@/styles/common";
import { markNotificationsRead } from "@/services/notifications";
import FeedbackState from "@/components/FeedbackState";

export default function NotificationsView() {
  const router = useRouter();
  const [activity, setActivity] = useState<ApiActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(useCallback(() => {
    let active = true;
    void markNotificationsRead().catch((reason: unknown) => {
      if (active) {
        console.warn(
          "No se pudieron marcar las notificaciones como leídas.",
          reason instanceof Error ? reason.message : reason,
        );
      }
    });
    getActivity()
      .then((result) => { if (active) { setActivity(result); setError(""); } })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "No se pudieron cargar las notificaciones."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  return (
    <SafeAreaView style={common.screen} edges={["top", "bottom"]}>
      <AppHeader title="Notificaciones" back />
      <ScrollView contentContainerStyle={common.scroll}>
        <FeedbackState loading={loading} error={error} onRetry={() => {
          setLoading(true);
          setError("");
          void getActivity()
            .then((result) => setActivity(result))
            .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No se pudieron cargar las notificaciones."))
            .finally(() => setLoading(false));
        }} />
        {!loading && !error && !activity?.likes.length && !activity?.conversations.length ? (
          <Text style={[common.muted, { textAlign: "center" }]}>No tienes notificaciones nuevas.</Text>
        ) : null}
        {activity?.likes.map((like, index) => {
          const id = like.product?.id ?? like.product?._id;
          return (
            <TouchableOpacity
              key={like.id ?? like._id ?? index}
              onPress={() => id && router.push({ pathname: "/product/[id]", params: { id } })}
              style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 }}
            >
              <Icon name="heart" type="ionicon" color={colors.danger} />
              <Text style={{ color: colors.text, flex: 1 }}>{like.user?.fullName ?? "Alguien"} dio like a {like.product?.title ?? "tu publicación"}.</Text>
            </TouchableOpacity>
          );
        })}
        {activity?.conversations.map((conversation, index) => {
          const id = conversation.id ?? conversation._id;
          return (
            <TouchableOpacity
              key={id ?? index}
              onPress={() => id && router.push({ pathname: "/chat/[id]", params: { id } })}
              style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 }}
            >
              <Icon name="chatbubble-ellipses" type="ionicon" color={colors.accent} />
              <Text style={{ color: colors.text, flex: 1 }}>Nueva actividad en tu conversación: {conversation.product?.title ?? "Chat"}.</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
