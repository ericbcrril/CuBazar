import { useCallback, useState } from "react";
import { Alert, FlatList, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Button } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import FeedbackState from "@/components/FeedbackState";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import ProductCard from "@/components/ProductCard";
import Stars from "@/components/Stars";
import { useAuth } from "@/context/AuthContext";
import { createChat } from "@/services/chats";
import { getExplore } from "@/services/products";
import { getMyTransactions } from "@/services/transactions";
import type { ApiProduct, ApiTransaction, ExploreResponse } from "@/types/api";
import { btn, common } from "@/styles/common";
import styles from "@/styles/purchasesView";
import { money } from "@/utils/format";
import { normalizeImageUrl, toCardProduct } from "@/utils/product";

export default function PurchasesView() {
  const router = useRouter();
  const { user } = useAuth();
  const [verTodas, setVerTodas] = useState(false);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [explore, setExplore] = useState<ExploreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadPurchases = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [result, recommendations] = await Promise.all([getMyTransactions(), getExplore()]);
      setTransactions(result.filter((transaction) => transaction.buyerId === user?.id));
      setExplore(recommendations);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudieron cargar tus compras.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useFocusEffect(useCallback(() => {
    void loadPurchases();
  }, [loadPurchases]));

  const lista = verTodas ? transactions : transactions.slice(0, 2);
  const startChat = async (product: ApiProduct) => {
    try {
      const conversation = await createChat(product.id ?? product._id ?? "");
      const conversationId = conversation.id ?? conversation._id;
      if (!conversationId) throw new Error("La respuesta no contiene el identificador de conversación.");
      router.push({ pathname: "/chat/[id]", params: { id: conversationId } });
    } catch (reason) {
      Alert.alert("No se pudo abrir el chat", reason instanceof Error ? reason.message : "Intenta de nuevo.");
    }
  };

  return (
    <SafeAreaView style={common.screen} edges={["top", "bottom"]}>
      <AppHeader
        title="Mis compras"
        back
      />
      <ScrollView
        contentContainerStyle={common.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadPurchases(true)} />}
      >
        <FeedbackState loading={loading} error={error} onRetry={() => void loadPurchases()} />
        {!loading && !error && transactions.length === 0 ? (
          <Text style={[common.muted, { textAlign: "center" }]}>Aún no tienes compras.</Text>
        ) : null}
        {lista.map((transaction) => {
          const product = transaction.product;
          if (!product) return null;
          const id = transaction.id ?? transaction._id ?? product.id ?? product._id ?? product.title;
          return (
            <TouchableOpacity
              key={id}
              style={styles.item}
              onPress={() => router.push({ pathname: "/purchase/[id]", params: { id } })}
            >
              {normalizeImageUrl(product.images?.[0]?.imageUrl) ? (
                <Image source={{ uri: normalizeImageUrl(product.images?.[0]?.imageUrl) ?? "" }} style={{ width: 56, height: 56, borderRadius: 8 }} resizeMode="cover" />
              ) : (
                <ImagePlaceholder height={56} style={{ width: 56 }} />
              )}
              <View style={styles.info}>
                <Text style={styles.title}>{product.title}</Text>
                <Text style={styles.muted}>{transaction.seller?.fullName ?? "Vendedor"}</Text>
                <Text style={styles.muted}>{new Date(transaction.updatedAt).toLocaleDateString()}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.total}>{money(product.price)}</Text>
                {transaction.review ? <Stars value={transaction.review.rating} size={11} /> : null}
              </View>
            </TouchableOpacity>
          );
        })}

        {!verTodas && transactions.length > 2 && (
          <Button title="Mostrar más compras" onPress={() => setVerTodas(true)} containerStyle={btn.container} buttonStyle={btn.secondary} titleStyle={btn.title} />
        )}

        <Text style={common.sectionTitle}>Explora nuestras recomendaciones</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={explore?.newVentures ?? []}
          keyExtractor={(p) => p.id ?? p._id ?? p.title}
          renderItem={({ item }) => <ProductCard product={toCardProduct(item)} onPress={() => void startChat(item)} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
