import { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import FeedbackState from "@/components/FeedbackState";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { colors } from "@/constants/theme";
import { getMyTransactions } from "@/services/transactions";
import type { ApiTransaction } from "@/types/api";
import { normalizeImageUrl } from "@/utils/product";
import { money } from "@/utils/format";
import { common } from "@/styles/common";

export default function PurchaseDetailView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [transaction, setTransaction] = useState<ApiTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getMyTransactions()
      .then((items) => {
        if (!active) return;
        const found = items.find((item) => (item.id ?? item._id) === id);
        setTransaction(found ?? null);
        if (!found) setError("No se encontró la compra.");
      })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar la compra."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, loadAttempt]);

  const product = transaction?.product;
  const conversationId =
    transaction?.conversationId ??
    (transaction?.conversation as { id?: string; _id?: string } | undefined)?.id ??
    (transaction?.conversation as { id?: string; _id?: string } | undefined)?._id;
  const statusLabel =
    transaction?.status === "MUTUAL_CONFIRMED"
      ? "Completada"
      : transaction?.status === "CANCELLED"
        ? "Cancelada"
        : "Pendiente de confirmación";

  return (
    <SafeAreaView style={common.screen} edges={["top", "bottom"]}>
      <AppHeader title="Detalle de compra" back />
      {loading ? <FeedbackState loading /> : null}
      {!loading && error ? (
        <FeedbackState
          error={error}
          onRetry={() => {
            setLoading(true);
            setError("");
            setLoadAttempt((attempt) => attempt + 1);
          }}
        />
      ) : null}
      {transaction ? (
        <ScrollView contentContainerStyle={common.scroll}>
          {normalizeImageUrl(product?.images?.[0]?.imageUrl) ? (
            <Image
              source={{ uri: normalizeImageUrl(product?.images?.[0]?.imageUrl) ?? "" }}
              style={{ width: "100%", height: 220, borderRadius: 12 }}
              resizeMode="cover"
            />
          ) : (
            <ImagePlaceholder height={220} style={{ borderRadius: 12 }} />
          )}
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 14 }}>{product?.title ?? "Producto"}</Text>
          <Text style={{ color: colors.accent, fontSize: 18, fontWeight: "800", marginTop: 8 }}>{money(product?.price ?? 0)} MXN</Text>
          <View style={{ marginTop: 16, backgroundColor: colors.surfaceAlt, borderRadius: 12, padding: 14 }}>
            <Text style={{ color: colors.text, fontWeight: "700" }}>Estado</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>{statusLabel}</Text>
            <Text style={{ color: colors.text, fontWeight: "700", marginTop: 12 }}>Vendedor</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>{transaction.seller?.fullName ?? "Vendedor"}</Text>
            <Text style={{ color: colors.text, fontWeight: "700", marginTop: 12 }}>Fecha</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>{new Date(transaction.updatedAt).toLocaleString()}</Text>
          </View>
          {conversationId ? (
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/chat/[id]", params: { id: conversationId } })}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: colors.primary, borderRadius: 10, padding: 14, marginTop: 14 }}
            >
              <Icon name="chatbubble-outline" type="ionicon" color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800" }}>Abrir chat con el vendedor</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
