import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "@/components/AppHeader";
import MenuDrawer from "@/components/MenuDrawer";
import NotificationBell from "@/components/NotificationBell";
import ProductCard from "@/components/ProductCard";
import FeedbackState from "@/components/FeedbackState";
import { colors } from "@/constants/theme";
import { getExplore as getExploreProducts } from "@/services/products";
import type { ExploreResponse } from "@/types/api";
import { toCardProduct } from "@/utils/product";
import { common } from "@/styles/common";
import searchStyles from "@/styles/searchBar";

export default function ExploreView() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [explore, setExplore] = useState<ExploreResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const q = busqueda.trim().toLowerCase();

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError("");
    getExploreProducts()
      .then((result) => {
        if (active) setExplore(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar explorar.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []));

  const secciones = explore
    ? [
        { titulo: "Nuevos emprendimientos", datos: explore.newVentures },
        { titulo: "En tendencia", datos: explore.trending },
        { titulo: "Grandes ofertas", datos: explore.greatDeals },
      ]
    : [];
  const seccionesFiltradas = secciones
    .map((section) => ({
      ...section,
      datos: q
        ? section.datos.filter((product) =>
            `${product.title} ${typeof product.seller === "object" && product.seller ? product.seller.fullName : ""} ${product.description}`
              .toLowerCase()
              .includes(q),
          )
        : section.datos,
    }))
    .filter((section) => section.datos.length > 0);
  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <AppHeader
        title="Explorar"
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
            <TouchableOpacity onPress={() => router.push("/chats")} style={{ width: 40, height: 44, alignItems: "center", justifyContent: "center" }} accessibilityRole="button" accessibilityLabel="Abrir chats">
              <Icon name="chatbubble-outline" type="ionicon" color={colors.text} />
            </TouchableOpacity>
            <NotificationBell />
          </>
        }
      />
      <MenuDrawer visible={menuVisible} onClose={() => setMenuVisible(false)} />
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
      <ScrollView contentContainerStyle={common.scroll}>
        <FeedbackState loading={loading} error={error} onRetry={() => {
          setLoading(true);
          setError("");
          void getExploreProducts()
            .then(setExplore)
            .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "No se pudo cargar explorar."))
            .finally(() => setLoading(false));
        }} />
        {!loading && !error && secciones.every((section) => section.datos.length === 0) ? (
          <Text style={[common.muted, { textAlign: "center" }]}>
            No hay publicaciones disponibles. Explorar solo muestra publicaciones activas de vendedores disponibles;
            “Nuevos emprendimientos” incluye publicaciones de los últimos siete días.
          </Text>
        ) : null}
        {!loading && !error && Boolean(q) && seccionesFiltradas.length === 0 ? (
          <Text style={[common.muted, { textAlign: "center" }]}>No encontramos publicaciones para “{busqueda.trim()}”.</Text>
        ) : null}
        {seccionesFiltradas.map((sec) => {
          return (
            <View key={sec.titulo}>
              <Text style={common.sectionTitle}>{sec.titulo}</Text>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={sec.datos}
                keyExtractor={(p) => p.id ?? p._id ?? p.title}
                renderItem={({ item }) => (
                  <ProductCard
                    product={toCardProduct(item)}
                    onPress={() => router.push({ pathname: "/product/[id]", params: { id: item.id ?? item._id ?? "" } })}
                  />
                )}
              />
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
