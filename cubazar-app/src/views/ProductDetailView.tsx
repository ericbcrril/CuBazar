import { useEffect, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import FeedbackState from "@/components/FeedbackState";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { colors } from "@/constants/theme";
import { createChat } from "@/services/chats";
import { createProductComment, getProduct, toggleProductLike } from "@/services/products";
import type { ApiComment, ApiProduct } from "@/types/api";
import { conditionLabel, normalizeImageUrl } from "@/utils/product";
import { money } from "@/utils/format";
import { common } from "@/styles/common";
import UserAvatar from "@/components/UserAvatar";
import ImageCollage from "@/components/ImageCollage";

export default function ProductDetailView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [openingChat, setOpeningChat] = useState(false);
  const [error, setError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getProduct(id)
      .then((result) => {
        if (!active) return;
        setProduct(result);
        setComments(result.comments ?? []);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar la publicación.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, loadAttempt]);

  const toggleLike = async () => {
    if (!product) return;
    const wasLiked = product.isLikedByMe ?? product.likedByMe ?? false;
    setProduct({
      ...product,
      isLikedByMe: !wasLiked,
      likeCount: Math.max(0, (product.likeCount ?? 0) + (wasLiked ? -1 : 1)),
    });
    try {
      const result = await toggleProductLike(product.id ?? product._id ?? "");
      setProduct((current) => current ? { ...current, isLikedByMe: result.liked, likeCount: result.totalLikes } : current);
    } catch (reason) {
      setProduct({
        ...product,
        isLikedByMe: wasLiked,
        likeCount: product.likeCount ?? 0,
      });
      setError(reason instanceof Error ? reason.message : "No se pudo actualizar el like.");
    }
  };

  const sendComment = async () => {
    if (!product || !commentText.trim()) return;
    setSending(true);
    setError("");
    try {
      const created = await createProductComment(product.id ?? product._id ?? "", commentText.trim());
      setComments((previous) => [...previous, created]);
      setCommentText("");
      setProduct((current) => current ? { ...current, commentCount: (current.commentCount ?? 0) + 1 } : current);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo enviar el comentario.");
    } finally {
      setSending(false);
    }
  };

  const openChat = async () => {
    if (!product) return;
    setOpeningChat(true);
    setError("");
    try {
      const conversation = await createChat(product.id ?? product._id ?? "");
      const conversationId = conversation.id ?? conversation._id;
      if (!conversationId) throw new Error("No se recibió el identificador del chat.");
      router.push({ pathname: "/chat/[id]", params: { id: conversationId } });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo abrir el chat.");
    } finally {
      setOpeningChat(false);
    }
  };

  const seller = product?.seller && typeof product.seller === "object" ? product.seller.fullName : "Vendedor";
  const sellerUser = product?.seller && typeof product.seller === "object" ? product.seller : null;

  return (
    <SafeAreaView style={common.screen} edges={["top", "bottom"]}>
      <AppHeader title={product?.title ?? "Detalle"} back />
      {loading ? (
        <FeedbackState loading />
      ) : !product ? (
        <FeedbackState
          error={error || "No se encontró la publicación."}
          onRetry={() => {
            setLoading(true);
            setError("");
            setLoadAttempt((attempt) => attempt + 1);
          }}
        />
      ) : (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <FlatList
            data={comments}
            keyExtractor={(comment, index) => comment.id ?? comment._id ?? `${comment.createdAt}-${index}`}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <View>
                {product.images?.length ? (
                  <ImageCollage
                    urls={product.images.map((image) => normalizeImageUrl(image.imageUrl)).filter((url): url is string => Boolean(url))}
                    height={260}
                  />
                ) : (
                  <ImagePlaceholder height={260} style={{ borderRadius: 12 }} />
                )}
                {sellerUser ? (
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: "/user/[id]", params: { id: sellerUser.id } })}
                    style={{ alignSelf: "flex-start", minHeight: 44, justifyContent: "center", marginTop: 4 }}
                  >
                    <Text style={{ color: colors.accent, fontWeight: "700" }}>
                      Ver perfil de {seller}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <Text style={{ color: colors.text, fontSize: 22, fontWeight: "800", marginTop: 14 }}>{product.title}</Text>
                {product.status === "SOLD" ? (
                  <View style={{ alignSelf: "flex-start", marginTop: 8, backgroundColor: colors.danger, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>VENDIDO</Text>
                  </View>
                ) : null}
                <Text style={{ color: colors.muted, marginTop: 4 }}>Publicado por {seller}</Text>
                {product.type === "VENTA" ? (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                    <Text style={{ color: colors.accent, fontWeight: "800", fontSize: 18 }}>{money(product.price)} MXN</Text>
                    <Text style={{ color: colors.muted }}>{conditionLabel(product.condition)}</Text>
                  </View>
                ) : null}
                <Text style={{ color: colors.text, marginTop: 12, lineHeight: 20 }}>{product.description}</Text>
                <View style={{ flexDirection: "row", gap: 16, marginTop: 14 }}>
                  <TouchableOpacity
                    onPress={() => void toggleLike()}
                    style={{ minHeight: 44, flexDirection: "row", alignItems: "center" }}
                    accessibilityRole="button"
                    accessibilityLabel={`${(product.isLikedByMe ?? product.likedByMe) ? "Quitar me gusta" : "Dar me gusta"}; ${product.likeCount ?? 0} likes`}
                  >
                    <Icon name={(product.isLikedByMe ?? product.likedByMe) ? "heart" : "heart-outline"} type="ionicon" color={(product.isLikedByMe ?? product.likedByMe) ? colors.danger : colors.muted} />
                    <Text style={{ color: colors.text, marginLeft: 6 }}>{product.likeCount ?? 0}</Text>
                  </TouchableOpacity>
                  {product.type === "VENTA" && product.status !== "SOLD" && product.seller && typeof product.seller === "object" ? (
                    <TouchableOpacity
                      onPress={() => void openChat()}
                      disabled={openingChat}
                      style={{ minHeight: 44, flexDirection: "row", alignItems: "center" }}
                      accessibilityRole="button"
                      accessibilityLabel="Contactar al vendedor"
                    >
                      <Icon name="chatbubble-outline" type="ionicon" color={colors.accent} />
                      <Text style={{ color: colors.accent, marginLeft: 6 }}>
                        {openingChat ? "Abriendo chat..." : "Contactar"}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700", marginTop: 22, marginBottom: 8 }}>Comentarios</Text>
              </View>
            }
            ListEmptyComponent={<Text style={[common.muted, { textAlign: "center", marginVertical: 12 }]}>Aún no hay comentarios.</Text>}
            renderItem={({ item }) => {
              const author = item.user && typeof item.user === "object" ? item.user.fullName : "Usuario";
              return (
                <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: "row", gap: 10 }}>
                  <UserAvatar
                    uri={item.user && typeof item.user === "object" ? item.user.profilePictureUrl : null}
                    size={32}
                    onPress={
                      item.user && typeof item.user === "object"
                        ? () => router.push({ pathname: "/user/[id]", params: { id: item.user && typeof item.user === "object" ? item.user.id : "" } })
                        : undefined
                    }
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>{author}</Text>
                    <Text style={{ color: colors.text, marginTop: 4 }}>{item.content}</Text>
                  </View>
                </View>
              );
            }}
          />
          {error ? <Text accessibilityRole="alert" style={{ color: colors.danger, textAlign: "center", marginHorizontal: 16 }}>{error}</Text> : null}
          <View style={{ flexDirection: "row", alignItems: "center", padding: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Escribe un comentario"
              placeholderTextColor={colors.muted}
              maxLength={500}
              style={{ flex: 1, height: 42, color: colors.text, backgroundColor: colors.surfaceAlt, borderRadius: 20, paddingHorizontal: 14 }}
            />
            <TouchableOpacity
              onPress={() => void sendComment()}
              disabled={sending || !commentText.trim()}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
              accessibilityRole="button"
              accessibilityLabel={sending ? "Enviando comentario" : "Enviar comentario"}
            >
              <Icon name="send" type="ionicon" color={sending || !commentText.trim() ? colors.muted : colors.primary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
