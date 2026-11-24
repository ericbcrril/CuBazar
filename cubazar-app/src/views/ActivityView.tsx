import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import { useAuth } from "@/context/AuthContext";
import { getActivity } from "@/services/users";
import type { ApiActivity } from "@/types/api";
import { colors } from "@/constants/theme";
import { common } from "@/styles/common";
import NotificationBell from "@/components/NotificationBell";
import FeedbackState from "@/components/FeedbackState";

export default function ActivityView() {
  const router = useRouter();
  const { user } = useAuth();
  const [activity, setActivity] = useState<ApiActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    getActivity()
      .then((result) => { if (active) { setActivity(result); setError(""); } })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar la actividad."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <AppHeader
        title="Actividad"
        right={
          <>
            <TouchableOpacity onPress={() => router.push("/chats")} style={{ width: 40, height: 44, alignItems: "center", justifyContent: "center" }} accessibilityRole="button" accessibilityLabel="Abrir chats">
              <Icon name="chatbubble-outline" type="ionicon" color={colors.text} />
            </TouchableOpacity>
            <NotificationBell />
          </>
        }
      />
      <ScrollView contentContainerStyle={common.scroll}>
        <FeedbackState loading={loading} error={error} onRetry={() => {
          setLoading(true);
          setError("");
          void getActivity()
            .then((result) => setActivity(result))
            .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No se pudo cargar la actividad."))
            .finally(() => setLoading(false));
        }} />
        <Text style={common.sectionTitle}>Likes recientes</Text>
        {!loading && !activity?.likes.length ? <Text style={common.muted}>Aún no hay likes en tus publicaciones.</Text> : null}
        {activity?.likes.map((like, index) => (
          <TouchableOpacity
            key={like.id ?? like._id ?? index}
            style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 }}
            onPress={() => {
              const id = like.product?.id ?? like.product?._id;
              if (id) router.push({ pathname: "/product/[id]", params: { id } });
            }}
          >
            <Icon name="heart" type="ionicon" color={colors.danger} />
            <Text style={{ color: colors.text, flex: 1 }}>
              {like.user?.fullName ?? "Alguien"} dio like a {like.product?.title ?? "tu publicación"}
            </Text>
          </TouchableOpacity>
        ))}
        <Text style={common.sectionTitle}>Conversaciones iniciadas</Text>
        {!loading && !activity?.conversations.length ? <Text style={common.muted}>Aún no tienes conversaciones.</Text> : null}
        {activity?.conversations.map((conversation, index) => {
          const other = conversation.buyerId === user?.id ? conversation.seller : conversation.buyer;
          const id = conversation.id ?? conversation._id;
          return (
            <TouchableOpacity
              key={id ?? index}
              style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 }}
              onPress={() => id && router.push({ pathname: "/chat/[id]", params: { id } })}
            >
              <Icon name="chatbubble-ellipses-outline" type="ionicon" color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: "700" }}>{other?.fullName ?? "Usuario"}</Text>
                <Text style={{ color: colors.muted }} numberOfLines={1}>{conversation.product?.title ?? "Conversación"}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
