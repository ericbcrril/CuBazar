import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { featured } from '@/data/mock';
import { colors, common, spacing } from '@/styles/theme';

const sections = [
  { key: 'nuevos', title: 'Nuevos emprendimientos', product: featured.nuevos },
  { key: 'tendencia', title: 'En tendencia', product: featured.tendencia },
  { key: 'ofertas', title: 'Grandes ofertas', product: featured.ofertas },
] as const;

export default function ExploreScreen() {
  return (
    <View style={common.screen}>
      <Header title="Explorar" showMenu showActions />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        {sections.map((s) => (
          <View key={s.key}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            {/* Carrusel: aquí puedes cambiar por FlatList horizontal cuando haya más productos */}
            <ProductCard product={s.product} />
            <View style={styles.dots}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { color: colors.text, fontWeight: '700', fontSize: 14, marginBottom: spacing.sm },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: spacing.sm },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
});
