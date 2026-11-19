import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { misPublicaciones } from "@/data/mock";
import { common } from "@/styles/common";
import styles from "@/styles/myPostsView";
import { money } from "@/utils/format";

type Tab = "publicadas" | "borradores";

export default function MyPostsView() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("publicadas");
  const datos = misPublicaciones[tab];

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <AppHeader title="Mis publicaciones" back />
      <Text style={styles.summary}>
        Tienes <Text style={styles.bold}>{misPublicaciones.total} publicaciones</Text> en tu cuenta y{" "}
        <Text style={styles.bold}>{misPublicaciones.vistas24h} vistas</Text> en las últimas 24hrs
      </Text>

      <View style={styles.tabs}>
        {(["publicadas", "borradores"] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === "publicadas" ? "Publicadas" : "Borradores"}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={datos}
        numColumns={2}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={<Text style={styles.empty}>No tienes {tab} por ahora.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.cell} onPress={() => router.push({ pathname: "/editar-publicacion", params: { id: item.id } })}>
            <ImagePlaceholder height={130} />
            <View style={styles.label}>
              <Text style={styles.labelText}>{item.titulo} · {money(item.precio)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
