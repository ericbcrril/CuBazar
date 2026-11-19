import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { Avatar, SearchBar } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import { colors } from "@/constants/theme";
import { chats } from "@/data/mock";
import { common } from "@/styles/common";
import styles from "@/styles/chatsView";
import searchStyles from "@/styles/searchBar";

export default function ChatsView() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [soloNoLeidos, setSoloNoLeidos] = useState(false);

  const q = busqueda.trim().toLowerCase();
  const lista = chats.filter((c) => (!soloNoLeidos || c.noLeido) && c.usuario.toLowerCase().includes(q));

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <AppHeader title="Chats" />
      <SearchBar
        placeholder="Buscar"
        value={busqueda}
        onChangeText={setBusqueda}
        platform="default"
        containerStyle={searchStyles.container}
        inputContainerStyle={searchStyles.inputContainer}
        inputStyle={searchStyles.input}
      />
      <View style={styles.filters}>
        {[
          { label: "Todos", valor: false },
          { label: "No leídos", valor: true },
        ].map((f) => (
          <TouchableOpacity key={f.label} style={[styles.chip, soloNoLeidos === f.valor && styles.chipActive]} onPress={() => setSoloNoLeidos(f.valor)}>
            <Text style={[styles.chipText, soloNoLeidos === f.valor && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={lista}
        keyExtractor={(c) => c.id}
        contentContainerStyle={common.scroll}
        ListEmptyComponent={<Text style={[common.muted, { textAlign: "center" }]}>No hay chats.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => router.push({ pathname: "/chat/[id]", params: { id: item.id } })}>
            <Avatar rounded size={44} icon={{ name: "person", type: "ionicon" }} containerStyle={{ backgroundColor: colors.surfaceAlt }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.usuario}</Text>
              <Text style={styles.last} numberOfLines={1}>{item.ultimo}</Text>
            </View>
            {item.noLeido ? <View style={styles.dot} /> : null}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
