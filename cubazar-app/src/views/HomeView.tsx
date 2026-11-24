import { useCallback, useState } from "react";
import { FlatList, Text, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import MenuDrawer from "@/components/MenuDrawer";
import UserAvatar from "@/components/UserAvatar";
import NotificationBell from "@/components/NotificationBell";
import PostCard from "@/components/PostCard";
import FeedbackState from "@/components/FeedbackState";
import { colors } from "@/constants/theme";
import { getFeed, toggleProductLike } from "@/services/products";
import type { ApiProduct } from "@/types/api";
import { common } from "@/styles/common";
import styles from "@/styles/homeView";

export default function HomeView() {
  const router = useRouter();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError("");
    getFeed()
      .then((result) => {
        if (active) setProducts(result.products);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar el inicio.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []));

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <AppHeader
        title="Inicio"
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
            <TouchableOpacity onPress={() => router.navigate("/chats")} style={{ width: 40, height: 44, alignItems: "center", justifyContent: "center" }} accessibilityRole="button" accessibilityLabel="Abrir chats">
              <Icon name="chatbubble-outline" type="ionicon" color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.navigate("/(tabs)/publicar")} style={{ width: 40, height: 44, alignItems: "center", justifyContent: "center" }} accessibilityRole="button" accessibilityLabel="Crear publicación">
              <Icon name="add" type="ionicon" color={colors.text} />
            </TouchableOpacity>
            <NotificationBell />
          </>
        }
      />
      <MenuDrawer visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <FlatList
        data={products}
        keyExtractor={(product) => product.id ?? product._id ?? product.title}
        contentContainerStyle={common.scroll}
        ListHeaderComponent={
          <>
            <TouchableOpacity style={styles.composer} onPress={() => router.navigate("/(tabs)/publicar")}>
              <UserAvatar uri={undefined} size={32} />
              <Text style={styles.composerText}>Publica algo...</Text>
            </TouchableOpacity>
            <FeedbackState loading={loading} error={error} onRetry={() => {
              setLoading(true);
              setError("");
              void getFeed()
                .then((result) => setProducts(result.products))
                .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No se pudo cargar el inicio."))
                .finally(() => setLoading(false));
            }} />
            {!loading && !error && products.length === 0 ? (
              <Text style={[common.muted, { textAlign: "center" }]}>
                No hay publicaciones disponibles. El catálogo muestra publicaciones activas de vendedores disponibles.
                Activa “Disponible para vender” en Cuenta para mostrar tus publicaciones.
              </Text>
            ) : null}
          </>
        }
        renderItem={({ item }) => (
          <PostCard
            post={{
              autor: typeof item.seller === "object" && item.seller ? item.seller.fullName : "Vendedor",
              tipo: item.type === "VENTA" ? "Venta" : "Publicación",
              hace: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
              title: item.title,
              descripcion: item.description,
              likes: item.likeCount ?? 0,
              comentarios: item.commentCount ?? 0,
              liked: item.isLikedByMe ?? item.likedByMe ?? false,
              imageUrls: (item.images ?? [])
                .map((image) => image.imageUrl)
                .filter((url): url is string => Boolean(url)),
              precio: item.price,
              condicion: item.type === "VENTA" ? (item.condition === "NUEVO" ? "Nuevo" : item.condition === "USADO_COMO_NUEVO" ? "Usado como nuevo" : item.condition === "USADO_BUEN_ESTADO" ? "Usado en buen estado" : "Usado aceptable") : undefined,
              sellerId: typeof item.seller === "object" && item.seller ? item.seller.id : undefined,
              sellerAvatar: typeof item.seller === "object" && item.seller ? item.seller.profilePictureUrl : null,
            }}
            onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id ?? item._id ?? "" } })}
            onLike={() => {
              const wasLiked = item.isLikedByMe ?? item.likedByMe ?? false;
              setProducts((previous) => previous.map((p) =>
                (p.id ?? p._id) === (item.id ?? item._id)
                  ? { ...p, isLikedByMe: !wasLiked, likeCount: Math.max(0, (p.likeCount ?? 0) + (wasLiked ? -1 : 1)) }
                  : p,
              ));
              void toggleProductLike(item.id ?? item._id ?? "")
                .then((result) => setProducts((previous) => previous.map((p) =>
                  (p.id ?? p._id) === (item.id ?? item._id)
                    ? { ...p, isLikedByMe: result.liked, likeCount: result.totalLikes }
                    : p,
                )))
                .catch((reason) => setError(reason instanceof Error ? reason.message : "No se pudo actualizar el like."));
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}
