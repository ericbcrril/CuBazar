import { useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Button, Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import AppHeader from "@/components/AppHeader";
import Stars from "@/components/Stars";
import { colors } from "@/constants/theme";
import { chats, mensajesIniciales } from "@/data/mock";
import { btn, common } from "@/styles/common";
import styles from "@/styles/chatView";

type Paso = "pregunta" | "calificar" | "fin";

// /chat/[id]?rol=vendedor  -> pregunta "¿Le has vendido algo a este usuario?"
// /chat/[id]              -> pregunta "¿Le has comprado algo a este vendedor?"
export default function ChatView() {
  const { id, rol } = useLocalSearchParams<{ id: string; rol?: string }>();
  const chat = chats.find((c) => c.id === id) ?? chats[0];
  const esVendedor = rol === "vendedor";

  const [mensajes, setMensajes] = useState(mensajesIniciales);
  const [texto, setTexto] = useState("");
  const [paso, setPaso] = useState<Paso>("pregunta");
  const [estrellas, setEstrellas] = useState(0);

  const enviar = () => {
    if (!texto.trim()) return;
    setMensajes((m) => [...m, { id: String(Date.now()), mio: true, texto: texto.trim() }]);
    setTexto("");
  };

  // Regla del diseño: solo se califica si AMBOS dicen que sí.
  // Aquí se asume que la otra persona confirmó; con el backend, espera su respuesta.
  const confirmar = () => setPaso("calificar");

  const calificar = (n: number) => {
    setEstrellas(n);
    // TODO: POST de la calificación al backend
    setTimeout(() => setPaso("fin"), 400);
  };

  return (
    <SafeAreaView style={common.screen} edges={["top", "bottom"]}>
      <AppHeader title={chat.usuario} back />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          data={mensajes}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.mio ? styles.mine : styles.theirs]}>
              <Text style={styles.bubbleText}>{item.texto}</Text>
            </View>
          )}
        />

        {paso === "pregunta" && (
          <View style={styles.prompt}>
            <Text style={styles.promptText}>
              {esVendedor ? "¿Le has vendido algo a este usuario?" : "¿Le has comprado algo a este vendedor?"}
            </Text>
            <View style={styles.promptButtons}>
              <Button title="Claro" onPress={confirmar} buttonStyle={[btn.primary, { paddingHorizontal: 24 }]} titleStyle={btn.title} />
              <Button title="Nunca" onPress={() => setPaso("fin")} buttonStyle={[btn.secondary, { paddingHorizontal: 24 }]} titleStyle={btn.title} />
            </View>
          </View>
        )}

        {paso === "calificar" && (
          <View style={styles.prompt}>
            <Text style={styles.promptText}>¿Qué calificación le das a este vendedor?</Text>
            <Stars value={estrellas} size={38} onChange={calificar} />
          </View>
        )}

        {paso === "fin" && estrellas > 0 && (
          <View style={styles.prompt}>
            <Text style={styles.thanks}>¡Gracias por tu calificación!</Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Mensaje"
            placeholderTextColor={colors.muted}
            value={texto}
            onChangeText={setTexto}
            onSubmitEditing={enviar}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.send} onPress={enviar}>
            <Icon name="send" type="ionicon" color={colors.text} size={18} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
