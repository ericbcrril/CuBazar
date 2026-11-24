import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Button, Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import FeedbackState from "@/components/FeedbackState";
import Stars from "@/components/Stars";
import UserAvatar from "@/components/UserAvatar";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import {
  connectChatSocket,
  getChats,
  getMessages,
  type NewMessage,
  type SocketFailure,
  type TransactionUpdate,
  type PurchaseConfirmationState,
  deleteChat,
} from "@/services/chats";
import { confirmTransaction, createReview } from "@/services/transactions";
import type { ApiConversation, ApiMessage } from "@/types/api";
import { btn, common } from "@/styles/common";
import styles from "@/styles/chatView";

type Paso = "pregunta" | "espera" | "calificar" | "fin";

export default function ChatView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const socketRef = useRef<Awaited<ReturnType<typeof connectChatSocket>> | null>(null);
  const [mensajes, setMensajes] = useState<ApiMessage[]>([]);
  const [conversation, setConversation] = useState<ApiConversation | null>(null);
  const [texto, setTexto] = useState("");
  const [paso, setPaso] = useState<Paso>("pregunta");
  const [estrellas, setEstrellas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [ratedTargets, setRatedTargets] = useState<("BUYER" | "SELLER" | "PRODUCT")[]>([]);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [ratingSaving, setRatingSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    let socket: Awaited<ReturnType<typeof connectChatSocket>> | null = null;
    const loadChat = async () => {
      try {
        const [messagePage, conversations] = await Promise.all([getMessages(id), getChats()]);
        if (!active) return;
        setMensajes(messagePage.messages);
        setMessageCount(messagePage.pagination.total);
        const currentConversation = conversations.find((item) => (item.id ?? item._id) === id) ?? null;
        setConversation(currentConversation);
        if (currentConversation?.transaction?.reviews) {
          const submitted = currentConversation.transaction.reviews
            .filter((review) => review.reviewerId === user?.id)
            .map((review) => review.targetType)
            .filter((target): target is "BUYER" | "SELLER" | "PRODUCT" => Boolean(target));
          setRatedTargets(submitted);
          const buyerRole = currentConversation.buyerId === user?.id;
          const requiredCount = buyerRole ? 2 : 1;
          if (submitted.length >= requiredCount) setPaso("fin");
        }
        if (currentConversation?.transaction?.status === "MUTUAL_CONFIRMED") {
          setPaso("calificar");
        } else if (
          currentConversation?.transaction?.buyerConfirmed !== null ||
          currentConversation?.transaction?.sellerConfirmed !== null
        ) {
          setPaso("espera");
        }

        const connectedSocket = await connectChatSocket();
        if (!active) {
          connectedSocket.disconnect();
          return;
        }
        socket = connectedSocket;
        socketRef.current = connectedSocket;
        connectedSocket.on("connect", () =>
          connectedSocket.emit("join_conversation", { conversationId: id }),
        );
        connectedSocket.on("new_message", (message: NewMessage) => {
          setMensajes((previous) => {
            if (previous.some((item) => item.id === message.id)) return previous;
            setMessageCount((count) => count + 1);
            return [...previous, { ...message, sender: undefined }];
          });
        });
        connectedSocket.on("purchase_confirmation", (state: PurchaseConfirmationState) => {
          setMessageCount(state.messageCount);
          setConversation((current) =>
            current?.transaction ? {
              ...current,
              transaction: {
                ...current.transaction,
                messageCount: state.messageCount,
                buyerConfirmed: state.buyerConfirmed,
                sellerConfirmed: state.sellerConfirmed,
                status: state.status,
              },
            } : current,
          );
        });
        connectedSocket.on("transaction_updated", (update: TransactionUpdate) => {
          setConversation((current) =>
            current?.transaction
              ? {
                  ...current,
                  transaction: {
                    ...current.transaction,
                    status: update.status,
                    buyerConfirmed: update.buyerConfirmed,
                    sellerConfirmed: update.sellerConfirmed,
                  },
                }
              : current,
          );
          if (update.canRate) setPaso("calificar");
          else if (update.buyerConfirmed || update.sellerConfirmed) setPaso("espera");
        });
        connectedSocket.on("socket_error", (failure: SocketFailure) => setError(failure.message));
        connectedSocket.on("connect_error", (reason: Error) => setError(reason.message));
        connectedSocket.connect();
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar el chat.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadChat();
    return () => {
      active = false;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [id, user?.id, loadAttempt]);

  const enviar = () => {
    if (!texto.trim()) return;
    if (!socketRef.current?.connected) {
      setError("El chat no está conectado. Intenta de nuevo.");
      return;
    }
    setError("");
    socketRef.current.emit("send_message", { conversationId: id, content: texto.trim() });
    setTexto("");
  };

  const confirmar = async (confirmed: boolean) => {
    if (!id) return;
    setSending(true);
    setError("");
    try {
      const result = await confirmTransaction(id, confirmed);
      if (confirmed && result.canRate) {
        setConversation((current) =>
          current?.transaction ? {
            ...current,
            transaction: { ...current.transaction, status: result.status, buyerConfirmed: result.buyerConfirmed, sellerConfirmed: result.sellerConfirmed },
          } : current,
        );
        setPaso("calificar");
      } else if (!confirmed) {
        setConversation((current) => current?.transaction ? {
          ...current,
          transaction: {
            ...current.transaction,
            ...(isBuyer
              ? { buyerConfirmed: false }
              : { sellerConfirmed: false }),
          },
        } : current);
        setPaso("espera");
      } else {
        setPaso("espera");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo confirmar la transacción.");
    } finally {
      setSending(false);
    }
  };

  const calificar = async (n: number, targetType: "BUYER" | "SELLER" | "PRODUCT") => {
    if (ratedTargets.includes(targetType) || ratingSaving) return;
    const buyerRole = conversation?.buyerId === user?.id;
    const allowedTargets: ("BUYER" | "SELLER" | "PRODUCT")[] = buyerRole
      ? ["SELLER", "PRODUCT"]
      : ["BUYER"];
    if (!allowedTargets.includes(targetType)) {
      setError("No tienes permiso para calificar ese elemento.");
      return;
    }
    setEstrellas(n);
    setRatingSaving(true);
    const transactionId = conversation?.transaction?.id ?? conversation?.transaction?._id;
    if (!transactionId) {
      setError("No se encontró la transacción para registrar la reseña.");
      setRatingSaving(false);
      return;
    }
    try {
      await createReview(transactionId, n, undefined, targetType);
      const next = [...ratedTargets, targetType];
      setRatedTargets(next);
      if (next.length === allowedTargets.length) setPaso("fin");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar la reseña.");
    } finally {
      setRatingSaving(false);
    }
  };

  const cambiarRespuesta = async () => {
    if (!id) return;
    setSending(true);
    setError("");
    try {
      await confirmTransaction(id, null);
      setConversation((current) => current?.transaction ? {
        ...current,
        transaction: {
          ...current.transaction,
          status: "PENDING_CONFIRMATION",
          ...(isBuyer
            ? { buyerConfirmed: null }
            : { sellerConfirmed: null }),
        },
      } : current);
      setPaso("pregunta");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo cambiar la respuesta.");
    } finally {
      setSending(false);
    }
  };

  const otherParticipant = conversation
    ? conversation.buyerId === user?.id
      ? conversation.seller
      : conversation.buyer
    : undefined;
  const isBuyer = Boolean(conversation && conversation.buyerId === user?.id);
  const allowedReviewTargets: ("BUYER" | "SELLER" | "PRODUCT")[] = isBuyer
    ? ["SELLER", "PRODUCT"]
    : ["BUYER"];
  const ownConfirmation = conversation?.transaction
    ? isBuyer
      ? conversation.transaction.buyerConfirmed
      : conversation.transaction.sellerConfirmed
    : null;
  const confirmationReady =
    messageCount >= 5 &&
    conversation?.transaction?.status === "PENDING_CONFIRMATION";

  const confirmDelete = () => {
    if (!id) return;
    Alert.alert(
      "Eliminar conversación",
      "¿Eliminar esta conversación? Esta acción no se puede deshacer",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            void deleteChat(id)
              .then(() => router.replace("/chats"))
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
      <AppHeader
        title={
          conversation?.product?.title
            ?? otherParticipant?.fullName
            ?? "Chat"
        }
        back
        right={
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {otherParticipant?.id ? (
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/user/[id]", params: { id: otherParticipant.id } })}
                style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
                accessibilityRole="button"
                accessibilityLabel={`Ver perfil de ${otherParticipant.fullName}`}
              >
                <UserAvatar uri={otherParticipant.profilePictureUrl} size={32} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={confirmDelete}
              style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
              accessibilityRole="button"
              accessibilityLabel="Eliminar conversación"
            >
              <Icon name="trash-outline" type="ionicon" color={colors.danger} size={22} />
            </TouchableOpacity>
          </View>
        }
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <FlatList
          data={mensajes}
          keyExtractor={(message) => message.id}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={loading ? <ActivityIndicator /> : undefined}
          ListEmptyComponent={!loading && !error ? <Text style={[common.muted, { textAlign: "center" }]}>Aún no hay mensajes.</Text> : undefined}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.senderId === user?.id ? styles.mine : styles.theirs]}>
              <Text style={styles.bubbleText}>{item.content}</Text>
            </View>
          )}
        />

        {paso === "pregunta" && confirmationReady && ownConfirmation === null && (
          <View style={styles.prompt}>
            <Text style={styles.promptText}>
              {isBuyer ? "¿Compraste este producto?" : "¿Le vendiste a este usuario?"}
            </Text>
            <View style={styles.promptButtons}>
              <Button title="Sí" onPress={() => void confirmar(true)} loading={sending} disabled={sending} buttonStyle={[btn.primary, { paddingHorizontal: 24 }]} titleStyle={btn.title} />
              <Button title="Aún no" onPress={() => void confirmar(false)} loading={sending} disabled={sending} buttonStyle={[btn.secondary, { paddingHorizontal: 24 }]} titleStyle={btn.title} />
            </View>
          </View>
          )}

        {paso === "espera" && (
          <View style={styles.prompt}>
            <Text style={styles.promptText}>
              {ownConfirmation === false
                ? "Marcaste esta compra como no realizada."
                : "Esperando la confirmación de la otra persona."}
            </Text>
            {ownConfirmation === false ? (
              <TouchableOpacity
                onPress={() => void cambiarRespuesta()}
                disabled={sending}
                accessibilityRole="button"
                style={{ minHeight: 44, justifyContent: "center" }}
              >
                <Text style={{ color: colors.accent, fontWeight: "800", textDecorationLine: "underline", marginTop: 8, textAlign: "center" }}>
                  cambiar respuesta aquí
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {paso === "calificar" && (
          <View style={styles.prompt}>
            {allowedReviewTargets.map((targetType) => (
              <View key={targetType} style={{ marginBottom: 10 }}>
                <Text style={styles.promptText}>
                  {targetType === "BUYER"
                    ? "Calificar al comprador"
                    : targetType === "SELLER"
                      ? "Calificar al vendedor"
                      : "Calificar al producto"}
                </Text>
                {ratedTargets.includes(targetType) ? (
                  <Text style={styles.thanks}>Calificación enviada.</Text>
                ) : (
                  <Stars
                    value={0}
                    size={32}
                    onChange={ratingSaving ? undefined : (rating) => void calificar(rating, targetType)}
                  />
                )}
              </View>
            ))}
          </View>
        )}

        {paso === "fin" && estrellas > 0 && (
          <View style={styles.prompt}>
            <Text style={styles.thanks}>¡Gracias por tu calificación!</Text>
          </View>
        )}

        {error ? <FeedbackState error={error} onRetry={() => {
          setLoading(true);
          setError("");
          setLoadAttempt((attempt) => attempt + 1);
        }} /> : null}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Mensaje"
            placeholderTextColor={colors.muted}
            value={texto}
            onChangeText={setTexto}
            onSubmitEditing={enviar}
            returnKeyType="send"
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.send}
            onPress={enviar}
            disabled={sending || !texto.trim()}
            accessibilityRole="button"
            accessibilityLabel="Enviar mensaje"
          >
            <Icon name="send" type="ionicon" color={colors.text} size={18} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
