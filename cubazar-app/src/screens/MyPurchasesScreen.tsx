import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/mock';
import { colors, common, radius, spacing } from '@/styles/theme';

export default function MyPurchasesScreen() {
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');

  const purchases = products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
  const visible = showAll ? purchases : purchases.slice(0, 2);

  return (
    <View style={common.screen}>
      <Header title="Mis compras" showBack />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Buscar en mis compras"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}

        {!showAll && purchases.length > 2 && (
          <TouchableOpacity style={common.primaryBtn} onPress={() => setShowAll(true)}>
            <Text style={common.primaryBtnText}>Mostrar más compras</Text>
          </TouchableOpacity>
        )}

        <Text style={[common.title, { marginTop: spacing.md }]}>Recomendaciones para ti</Text>
        <View style={styles.grid}>
          {products.map((p) => (
            <View key={p.id} style={styles.gridItem}>
              <ProductCard product={p} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, color: colors.text, paddingVertical: spacing.md, fontSize: 13 },
  grid: { gap: spacing.md },
  gridItem: {},
});
