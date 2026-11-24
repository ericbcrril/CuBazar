import { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import FeedbackState from "@/components/FeedbackState";
import UserAvatar from "@/components/UserAvatar";
import ProductCard from "@/components/ProductCard";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { createDirectChat } from "@/services/chats";
import { getPublicProfile } from "@/services/users";
import type { PublicProfile } from "@/types/api";
import { toCardProduct } from "@/utils/product";
import { common } from "@/styles/common";

export default function UserProfileView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getPublicProfile(id)
      .then((result) => { if (active) setProfile(result); })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar el perfil."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, loadAttempt]);

  const writePrivately = async () => {
    if (!profile || profile.id === user?.id) return;
    setSending(true);
    setError("");
    try {
      const conversation = await createDirectChat(profile.id);
      const conversationId = conversation.id ?? conversation._id;
      if (!conversationId) throw new Error("No se recibió el identificador del chat.");
      router.push({ pathname: "/chat/[id]", params: { id: conversationId } });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo iniciar el mensaje privado.");
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={common.screen} edges={["top", "bottom"]}>
      <AppHeader title={profile?.fullName ?? "Perfil"} back />
      {loading ? <FeedbackState loading /> : null}
      {!loading && error && !profile ? (
        <FeedbackState
          error={error}
          onRetry={() => {
            setLoading(true);
            setError("");
            setLoadAttempt((attempt) => attempt + 1);
          }}
        />
      ) : null}
      {error && profile ? <Text accessibilityRole="alert" style={[common.muted, { textAlign: "center", marginTop: 12 }]}>{error}</Text> : null}
      {profile ? (
        <FlatList
          data={profile.products}
          keyExtractor={(product) => product.id ?? product._id ?? product.title}
          contentContainerStyle={common.scroll}
          ListHeaderComponent={
            <View style={{ alignItems: "center", marginBottom: 18 }}>
              <UserAvatar uri={profile.profilePictureUrl} size={110} />
              <Text style={{ color: colors.text, fontSize: 21, fontWeight: "800", marginTop: 10 }}>{profile.fullName}</Text>
              <Text style={{ color: colors.muted, marginTop: 4 }}>
                {profile.ratingAverage === null
                  ? "Sin calificaciones"
                  : `${profile.ratingAverage.toFixed(1)} · ${profile.reviewCount} calificaciones`}
              </Text>
              {profile.id !== user?.id ? (
                <TouchableOpacity
                  onPress={() => void writePrivately()}
                  disabled={sending}
                  style={{ minHeight: 48, flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12 }}
                >
                  <Icon name="chatbubble-outline" type="ionicon" color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "800" }}>
                    {sending ? "Abriendo..." : "Escribir por privado"}
                  </Text>
                </TouchableOpacity>
              ) : null}
              <Text style={[common.sectionTitle, { alignSelf: "stretch", marginTop: 20 }]}>Publicaciones activas</Text>
            </View>
          }
          ListEmptyComponent={<Text style={[common.muted, { textAlign: "center" }]}>Este usuario no tiene publicaciones activas.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id ?? item._id ?? "" } })}
              style={{ marginBottom: 10 }}
            >
              <ProductCard product={toCardProduct(item)} />
            </TouchableOpacity>
          )}
        />
      ) : null}
    </SafeAreaView>
  );
}
