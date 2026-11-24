import React, { useMemo, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/mock';
import { colors, common, radius, spacing } from '@/styles/theme';

const categories = ['Todas', 'Comida', 'Tecnología', 'Papelería', 'Ropa'];
const locations = ['Todo el campus', 'Biblioteca', 'Cafetería', 'Módulo X'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [location, setLocation] = useState(locations[0]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const results = useMemo(
    () => products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <View style={common.screen}>
      <Header title="Buscar" showMenu showActions />
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="¿Qué se te antoja? (café, cargador, tacos…)"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View>
        <Chips label="Categoría" options={categories} value={category} onChange={setCategory} />
        <Chips label="Ubicación" options={locations} value={location} onChange={setLocation} />
        <TouchableOpacity
          style={[styles.chip, onlyAvailable && styles.chipActive, { marginLeft: spacing.lg, alignSelf: 'flex-start' }]}
          onPress={() => setOnlyAvailable((v) => !v)}
        >
          <Text style={styles.chipText}>Disponibles ahora</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        renderItem={({ item }) => <ProductCard product={item} />}
        ListEmptyComponent={<Text style={[common.muted, { textAlign: 'center' }]}>Sin resultados</Text>}
      />
    </View>
  );
}

function Chips({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ marginTop: spacing.sm }}>
      <Text style={[common.muted, { marginLeft: spacing.lg, marginBottom: 4 }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        {options.map((o) => (
          <TouchableOpacity key={o} style={[styles.chip, value === o && styles.chipActive]} onPress={() => onChange(o)}>
            <Text style={styles.chipText}>{o}</Text>
          </TouchableOpacity>
        ))}
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
    marginHorizontal: spacing.lg,
  },
  input: { flex: 1, color: colors.text, paddingVertical: spacing.md, fontSize: 13 },
  chip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.text, fontSize: 11 },
});
