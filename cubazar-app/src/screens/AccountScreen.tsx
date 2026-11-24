import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import { colors, common, radius, spacing } from '@/styles/theme';

export default function AccountScreen() {
  const router = useRouter();
  const [available, setAvailable] = useState(true);

  const items = [
    { label: 'Mis Pedidos', icon: 'receipt-outline' as const, to: '/mis-compras' as const },
    { label: 'Mis Publicaciones', icon: 'bag-outline' as const, to: '/mis-publicaciones' as const },
    { label: 'Acerca de CuBazar', icon: 'information-circle-outline' as const, to: '/acerca-de' as const },
  ];

  return (
    <View style={common.screen}>
      <Header title="Cuenta" showMenu />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, alignItems: 'center' }}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={64} color="#fff" />
        </View>
        <Text style={[common.title, { marginVertical: spacing.md }]}>Usuario 0</Text>

        <View style={styles.list}>
          {items.map((it) => (
            <TouchableOpacity key={it.label} style={styles.item} onPress={() => router.push(it.to)}>
              <Ionicons name={it.icon} size={24} color={colors.text} />
              <Text style={[common.text, styles.itemLabel]}>{it.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
          ))}

          <View style={styles.availability}>
            <View style={{ flex: 1 }}>
              <Text style={common.title}>Estoy disponible ahora</Text>
              <Text style={common.muted}>Los compradores te verán activo.</Text>
              <Text style={[common.muted, { color: available ? colors.success : colors.textMuted }]}>
                ● {available ? 'En línea' : 'Desconectado'}
              </Text>
            </View>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { width: '100%', gap: spacing.sm, marginTop: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  itemLabel: { flex: 1, textAlign: 'center', fontWeight: '600' },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
});
