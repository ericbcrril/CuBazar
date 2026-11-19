import { useState } from "react";
import { FlatList, ScrollView, Text, View } from "react-native";
import { Button, Icon } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";

import AppHeader from "@/components/AppHeader";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import ProductCard from "@/components/ProductCard";
import Stars from "@/components/Stars";
import { colors } from "@/constants/theme";
import { compras, explorar } from "@/data/mock";
import { btn, common } from "@/styles/common";
import styles from "@/styles/purchasesView";
import { money } from "@/utils/format";

export default function PurchasesView() {
  const [verTodas, setVerTodas] = useState(false);
  const lista = verTodas ? compras : compras.slice(0, 2);

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <AppHeader
        title="Mis compras"
        back
        right={
          <>
            <Icon name="search" type="ionicon" color={colors.text} size={20} />
            <Icon name="options-outline" type="ionicon" color={colors.text} size={20} />
          </>
        }
      />
      <ScrollView contentContainerStyle={common.scroll}>
        {lista.map((c) => (
          <View key={c.id} style={styles.item}>
            <ImagePlaceholder height={56} style={{ width: 56 }} />
            <View style={styles.info}>
              <Text style={styles.title}>{c.titulo}</Text>
              <Text style={styles.muted}>{c.vendedor}</Text>
              <Text style={styles.muted}>{c.fecha}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.total}>{money(c.total)}</Text>
              <Stars value={5} size={11} />
            </View>
          </View>
        ))}

        {!verTodas && compras.length > 2 && (
          <Button title="Mostrar más compras" onPress={() => setVerTodas(true)} containerStyle={btn.container} buttonStyle={btn.secondary} titleStyle={btn.title} />
        )}

        <Text style={common.sectionTitle}>Explora nuestras recomendaciones</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={explorar.nuevos}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => <ProductCard item={item} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
