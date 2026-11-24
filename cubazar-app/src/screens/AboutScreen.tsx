import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import { colors, common, radius, spacing } from '@/styles/theme';

const links = [
  { label: 'Términos y condiciones', icon: 'document-text-outline' },
  { label: 'Política de privacidad', icon: 'shield-checkmark-outline' },
  { label: 'Accesibilidad', icon: 'accessibility-outline' },
  { label: 'Soporte técnico', icon: 'help-buoy-outline' },
] as const;

export default function AboutScreen() {
  return (
    <View style={common.screen}>
      <Header title="Acerca de" showBack />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={styles.logo}>
          CU<Text style={{ color: colors.primary }}>-</Text>bazar
        </Text>
        <Text style={[common.muted, { textAlign: 'center' }]}>Versión 1.0.0</Text>
        <Text style={[common.text, { textAlign: 'center', lineHeight: 20 }]}>
          Bazar virtual para centros universitarios de la UdG. Compra, vende y descubre emprendimientos dentro del campus.
        </Text>

        <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
          {links.map((l) => (
            <TouchableOpacity key={l.label} style={styles.item}>
              <Ionicons name={l.icon} size={22} color={colors.text} />
              <Text style={[common.text, styles.itemLabel]}>{l.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { color: colors.text, fontSize: 34, fontWeight: '800', textAlign: 'center', marginTop: spacing.lg },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  itemLabel: { flex: 1, marginLeft: spacing.md, fontWeight: '600' },
});
