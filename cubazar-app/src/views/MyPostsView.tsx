import { useCallback, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import FeedbackState from "@/components/FeedbackState";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { colors } from "@/constants/theme";
import { deleteProduct, getMyProducts } from "@/services/products";
import { getMyProfile } from "@/services/users";
import type { ApiProduct } from "@/types/api";
import { common } from "@/styles/common";
import styles from "@/styles/myPostsView";
import { money } from "@/utils/format";
import { normalizeImageUrl } from "@/utils/product";
import ImageCollage from "@/components/ImageCollage";

type Tab = "publicadas" | "vendidas" | "borradores";

export default function MyPostsView() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("publicadas");
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [metrics, setMetrics] = useState({ publishedProducts: 0, drafts: 0, views24h: 0 });
  const [loadedTab, setLoadedTab] = useState<Tab | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const loading = loadedTab !== tab;

  const confirmDeleteDraft = (productId: string) => {
    Alert.alert("Eliminar borrador", "¿Eliminar este borrador?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          setDeletingId(productId);
          void deleteProduct(productId)
            .then(() => setProducts((previous) =>
              previous.filter((product) => (product.id ?? product._id) !== productId),
            ))
            .catch((reason: unknown) =>
              Alert.alert("Error", reason instanceof Error ? reason.message : "No se pudo eliminar el borrador."),
            )
            .finally(() => setDeletingId(null));
        },
      },
    ]);
  };

  useFocusEffect(useCallback(() => {
    let active = true;
    Promise.all([
      getMyProducts(
        tab === "publicadas"
          ? "PUBLISHED"
          : tab === "vendidas"
            ? "SOLD"
            : "DRAFT",
      ),
      getMyProfile(),
    ])
      .then(([result, profile]) => {
        if (active) {
          setProducts(result.products);
          setMetrics(profile.metrics);
          setError("");
          setLoadedTab(tab);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "No se pudieron cargar tus publicaciones.");
          setLoadedTab(tab);
        }
      });
    return () => {
      active = false;
    };
  }, [tab]));

  return (
    <SafeAreaView style={common.screen} edges={["top", "bottom"]}>
      <AppHeader title="Mis publicaciones" back />
      <Text style={styles.summary}>
        Tienes <Text style={styles.bold}>{metrics.publishedProducts + metrics.drafts} publicaciones</Text> en tu cuenta y{" "}
        <Text style={styles.bold}>{metrics.views24h} vistas</Text> en las últimas 24hrs
      </Text>

      <View style={styles.tabs}>
        {(["publicadas", "vendidas", "borradores"] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "publicadas" ? "Publicadas" : t === "vendidas" ? "Vendidas" : "Borradores"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(p) => p.id ?? p._id ?? p.title}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={
          <>
            <FeedbackState loading={loading} error={error} onRetry={() => {
              setLoadedTab(null);
              setError("");
              void Promise.all([
                getMyProducts(tab === "publicadas" ? "PUBLISHED" : tab === "vendidas" ? "SOLD" : "DRAFT"),
                getMyProfile(),
              ]).then(([result, profile]) => {
                setProducts(result.products);
                setMetrics(profile.metrics);
                setLoadedTab(tab);
              }).catch((reason: unknown) => {
                setError(reason instanceof Error ? reason.message : "No se pudieron cargar tus publicaciones.");
                setLoadedTab(tab);
              });
            }} />
          </>
        }
        ListEmptyComponent={!loading && !error ? <Text style={styles.empty}>No tienes {tab} por ahora.</Text> : undefined}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <TouchableOpacity
              onPress={() => router.push({ pathname: "/editar-publicacion", params: { id: item.id ?? item._id ?? "" } })}
              accessibilityRole="button"
              accessibilityLabel={`Editar ${item.title}`}
            >
              {item.images?.length ? (
                <ImageCollage
                  urls={(item.images ?? []).map((image) => normalizeImageUrl(image.imageUrl)).filter((url): url is string => Boolean(url))}
                  height={130}
                />
              ) : (
                <ImagePlaceholder height={130} />
              )}
              {item.status === "SOLD" ? (
                <View style={{ position: "absolute", top: 6, left: 6, backgroundColor: colors.danger, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>VENDIDO</Text>
                </View>
              ) : null}
              <View style={styles.label}>
                <Text style={styles.labelText} numberOfLines={1}>{item.title} · {money(item.price)}</Text>
              </View>
            </TouchableOpacity>
            {tab === "borradores" ? (
              <TouchableOpacity
                onPress={() => {
                  const productId = item.id ?? item._id;
                  if (productId) confirmDeleteDraft(productId);
                }}
                disabled={deletingId === (item.id ?? item._id)}
                accessibilityRole="button"
                accessibilityLabel={`Eliminar borrador ${item.title}`}
                style={{ position: "absolute", top: 4, right: 4, width: 44, height: 44, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,.72)", borderRadius: 22 }}
              >
                <Text style={{ color: "#fff", fontSize: 18 }}>{deletingId === (item.id ?? item._id) ? "…" : "×"}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
