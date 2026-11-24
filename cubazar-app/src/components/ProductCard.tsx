import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types/navigation';
import { colors, radius, spacing } from '@/styles/theme';

export function Stars({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Ionicons
          key={n}
          name={n <= Math.round(value) ? 'star' : 'star-outline'}
          size={size}
          color={colors.star}
        />
      ))}
    </View>
  );
}

export default function ProductCard({
  product,
  onPress,
}: {
  product: Product;
  onPress?: () => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      {imageFailed ? (
        <View style={[styles.image, { alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name="image-outline" size={24} color={colors.textMuted} />
        </View>
      ) : (
        <Image
          source={product.image}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <View style={styles.sellerRow}>
          <Text style={styles.seller} numberOfLines={1}>{product.seller}</Text>
          <Stars value={product.rating} />
          <Text style={styles.seller}>{product.rating.toFixed(1)}</Text>
        </View>
        <Text style={styles.price} numberOfLines={1}>${product.price} MXN</Text>
        <Text style={styles.desc} numberOfLines={3}>
          {product.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.md,
  },
  image: { width: 96, height: 96, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  info: { flex: 1 },
  title: { color: colors.text, fontWeight: '700', fontSize: 14 },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 2 },
  seller: { color: colors.textMuted, fontSize: 10 },
  price: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  desc: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
});
