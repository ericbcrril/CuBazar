import { useCallback, useState } from "react";
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import FeedbackState from "@/components/FeedbackState";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { deleteChat, getChats } from "@/services/chats";
import type { ApiConversation } from "@/types/api";
import { common } from "@/styles/common";
import styles from "@/styles/chatsView";
import searchStyles from "@/styles/searchBar";
import UserAvatar from "@/components/UserAvatar";
import ImageCollage from "@/components/ImageCollage";
import { normalizeImageUrl } from "@/utils/product";

export default function ChatsView() {
  const router = useRouter();
  const { user } = useAuth();
  const [busqueda, setBusqueda] = useState("");
  const [soloNoLeidos, setSoloNoLeidos] = useState(false);
  const [chats, setChats] = useState<ApiConversation[]>([]);
  const [loadedFilter, setLoadedFilter] = useState<"ALL" | "UNREAD" | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"PRODUCTOS" | "DIRECTOS">("PRODUCTOS");
  const filter = soloNoLeidos ? "UNREAD" : "ALL";
  const loading = loadedFilter !== filter;

  const q = busqueda.trim().toLowerCase();
  const lista = chats.filter((conversation) => {
    const isProductChat = Boolean(conversation.productId);
    if (tab === "PRODUCTOS" ? !isProductChat : isProductChat) return false;
    const other = conversation.buyerId === user?.id ? conversation.seller : conversation.buyer;
    const title = isProductChat ? conversation.product?.title : other?.fullName;
    return (title ?? "").toLowerCase().includes(q);
  });

  useFocusEffect(useCallback(() => {
    let active = true;
    getChats(filter)
      .then((result) => {
        if (active) {
          setChats(result);
          setError("");
          setLoadedFilter(filter);
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "No se pudieron cargar los chats.");
          setLoadedFilter(filter);
        }
      });
    return () => {
      active = false;
    };
  }, [filter]));

  const confirmDelete = (conversation: ApiConversation) => {
    const conversationId = conversation.id ?? conversation._id;
    if (!conversationId) return;
    Alert.alert(
      "Eliminar conversación",
      "¿Eliminar esta conversación? Esta acción no se puede deshacer",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            void deleteChat(conversationId)
              .then(() => {
                setChats((previous) =>
                  previous.filter((item) =>
                    (item.id ?? item._id) !== conversationId,
                  ),
                );
              })
              .catch((reason) => {
                setError(reason instanceof Error ? reason.message : "No se pudo eliminar la conversación.");
              });
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={common.screen} edges={["top", "bottom"]}>
      <AppHeader title="Chats" back />
      <View style={searchStyles.container}>
        <View style={searchStyles.inputContainer}>
          <TextInput
            placeholder="Buscar"
            placeholderTextColor={colors.muted}
            value={busqueda}
            onChangeText={setBusqueda}
            style={searchStyles.input}
          />
        </View>
      </View>
      <View style={styles.filters}>
        {([
          ["PRODUCTOS", "Productos"],
          ["DIRECTOS", "Mensajes directos"],
        ] as const).map(([value, label]) => (
          <TouchableOpacity
            key={value}
            style={[styles.chip, tab === value && styles.chipActive]}
            onPress={() => setTab(value)}
            accessibilityRole="button"
            accessibilityState={{ selected: tab === value }}
          >
            <Text style={[styles.chipText, tab === value && styles.chipTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.filters}>
        {[
          { label: "Todos", valor: false },
          { label: "No leídos", valor: true },
        ].map((f) => (
          <TouchableOpacity
            key={f.label}
            style={[styles.chip, soloNoLeidos === f.valor && styles.chipActive]}
            onPress={() => setSoloNoLeidos(f.valor)}
            accessibilityRole="button"
            accessibilityState={{ selected: soloNoLeidos === f.valor }}
          >
            <Text style={[styles.chipText, soloNoLeidos === f.valor && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={lista}
        keyExtractor={(conversation) => conversation.id ?? conversation._id ?? ""}
        contentContainerStyle={common.scroll}
        ListHeaderComponent={
          <>
            <FeedbackState loading={loading} error={error} onRetry={() => {
              setLoadedFilter(null);
              setError("");
              void getChats(filter)
                .then((result) => {
                  setChats(result);
                  setLoadedFilter(filter);
                })
                  .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No se pudieron cargar los chats."))
                  .finally(() => setLoadedFilter(filter));
            }} />
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <Text style={[common.muted, { textAlign: "center" }]}>
              {q
                ? "No encontramos chats con ese nombre."
                : soloNoLeidos
                  ? "No tienes chats sin leer."
                  : tab === "PRODUCTOS"
                    ? "Aún no tienes chats de productos."
                    : "Aún no tienes mensajes directos."}
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity
              style={{ flex: 1, minHeight: 44, flexDirection: "row", alignItems: "center", gap: 12 }}
              onLongPress={() => confirmDelete(item)}
              onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id ?? item._id ?? "" } })}
              accessibilityRole="button"
              accessibilityLabel={`Abrir conversación con ${item.productId ? item.product?.title ?? "Producto" : (item.buyerId === user?.id ? item.seller : item.buyer)?.fullName ?? "Usuario"}`}
            >
              {item.productId && item.product ? (
                <View style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden" }}>
                  {item.product.images?.[0]?.imageUrl ? (
                    <ImageCollage
                      urls={[normalizeImageUrl(item.product.images[0].imageUrl)].filter(
                        (url): url is string => Boolean(url),
                      )}
                      height={44}
                    />
                  ) : (
                    <View style={{ width: 44, height: 44, backgroundColor: colors.surfaceAlt }} />
                  )}
                </View>
              ) : (
                <UserAvatar
                  uri={(item.buyerId === user?.id ? item.seller : item.buyer)?.profilePictureUrl}
                  size={44}
                />
              )}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[styles.name, { flex: 1 }]} numberOfLines={1}>
                    {item.productId
                      ? item.product?.title ?? "Producto"
                      : (item.buyerId === user?.id ? item.seller : item.buyer)?.fullName ?? "Usuario"}
                  </Text>
                  {item.messages?.some((message) => message.senderId !== user?.id && !message.isRead) ? (
                    <View style={styles.dot} accessibilityLabel="Mensajes sin leer" />
                  ) : null}
                </View>
                <Text style={styles.last} numberOfLines={1}>
                  {item.messages?.[0]?.content ?? item.product?.title ?? ""}
                </Text>
                {item.productId && item.product?.status ? (
                  <Text style={{ color: item.product.status === "SOLD" ? colors.danger : colors.muted, fontSize: 11, marginTop: 2 }}>
                    {item.product.status === "SOLD" ? "Vendido" : item.product.status === "PUBLISHED" ? "Disponible" : item.product.status}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Eliminar conversación"
              onPress={() => confirmDelete(item)}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
            >
              <Icon name="trash-outline" type="ionicon" color={colors.danger} size={20} />
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
