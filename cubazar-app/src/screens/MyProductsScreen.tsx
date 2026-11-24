import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import { products } from '@/data/mock';
import { colors, common, radius, spacing } from '@/styles/theme';

type Tab = 'published' | 'drafts';

export default function MyProductsScreen() {
  const [tab, setTab] = useState<Tab>('published');

  const published = products;
  const drafts = products.slice(0, 1);
  const data = tab === 'published' ? published : drafts;

  return (
    <View style={common.screen}>
      <Header title="Mis Productos" showBack />
      <Text style={[common.muted, styles.hint]}>
        Resumen de publicaciones y vistas de las últimas 24 h. Toca una para editarla.
      </Text>

      <View style={styles.tabs}>
        {(['published', 'drafts'] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={styles.tabText}>
              {t === 'published' ? `Publicadas (${published.length})` : `Borradores (${drafts.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        columnWrapperStyle={{ gap: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.tile}>
            <Image source={item.image} style={styles.tileImage} />
            <View style={styles.tileInfo}>
              <Text style={common.text} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={common.muted}>${item.price} MXN</Text>
              <View style={[common.row, { gap: 4 }]}>
                <Ionicons name="eye" size={12} color={colors.textMuted} />
                <Text style={common.muted}>24 vistas</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hint: { paddingHorizontal: spacing.lg, textAlign: 'center' },
  tabs: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, paddingBottom: 0 },
  tab: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.sm, paddingVertical: spacing.sm, alignItems: 'center' },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.text, fontSize: 11, fontWeight: '600' },
  tile: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  tileImage: { width: '100%', height: 110, backgroundColor: colors.surfaceAlt },
  tileInfo: { padding: spacing.sm, gap: 2 },
});
