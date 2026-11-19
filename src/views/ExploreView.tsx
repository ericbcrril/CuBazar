import { useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import { Icon, SearchBar } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import ProductCard from "@/components/ProductCard";
import { colors } from "@/constants/theme";
import { explorar } from "@/data/mock";
import { common } from "@/styles/common";
import searchStyles from "@/styles/searchBar";

const secciones = [
  { titulo: "Nuevos emprendimientos", datos: explorar.nuevos },
  { titulo: "En tendencia", datos: explorar.tendencia },
  { titulo: "Grandes ofertas", datos: explorar.ofertas },
];

export default function ExploreView() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const q = busqueda.trim().toLowerCase();

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <AppHeader
        title="Explorar"
        left={<Icon name="menu" type="ionicon" color={colors.text} />}
        right={<Icon name="notifications-outline" type="ionicon" color={colors.text} />}
      />
      <SearchBar
        placeholder="Buscar"
        value={busqueda}
        onChangeText={setBusqueda}
        platform="default"
        containerStyle={searchStyles.container}
        inputContainerStyle={searchStyles.inputContainer}
        inputStyle={searchStyles.input}
      />
      <ScrollView contentContainerStyle={common.scroll}>
        {secciones.map((sec) => {
          const datos = q ? sec.datos.filter((p) => `${p.titulo} ${p.autor}`.toLowerCase().includes(q)) : sec.datos;
          if (!datos.length) return null;
          return (
            <View key={sec.titulo}>
              <Text style={common.sectionTitle}>{sec.titulo}</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={datos}
                keyExtractor={(p) => p.id}
                // Por ahora al tocar un producto se abre el chat con el vendedor
                renderItem={({ item }) => <ProductCard item={item} onPress={() => router.push({ pathname: "/chat/[id]", params: { id: "c1" } })} />}
              />
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
