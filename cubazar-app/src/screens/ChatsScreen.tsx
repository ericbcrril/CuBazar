import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import { colors, common, radius, spacing } from '@/styles/theme';

type ChatItem = { id: string; name: string; last: string; unread: boolean; color: string };

const chats: ChatItem[] = [
  { id: '1', name: 'Que onda, aún tienes el cargador?', last: '', unread: true, color: '#2196F3' },
  { id: '2', name: 'Me interesa tu producto', last: '', unread: true, color: '#B71C1C' },
  { id: '3', name: 'TIENES QUE VER ESTE PRODUCTO', last: '', unread: false, color: '#2ECC71' },
];

export default function ChatsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [query, setQuery] = useState('');

  const data = chats.filter(
    (c) => (filter === 'all' || c.unread) && c.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <View style={common.screen}>
      <Header title="Chats" showBack />
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Buscar"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <View style={styles.filters}>
        {(['all', 'unread'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.pill, filter === f && styles.pillActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={styles.pillText}>{f === 'all' ? 'Todos' : 'No leídos'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push({ pathname: '/chat/[id]', params: { id: 'c1' } })}
          >
            <View style={[styles.avatar, { backgroundColor: item.color }]}>
              <Ionicons name="person" size={18} color="#fff" />
            </View>
            <Text style={[common.text, { flex: 1 }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.unread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
      />
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
  filters: { flexDirection: 'row', gap: spacing.sm, padding: spacing.lg, paddingBottom: 0 },
  pill: { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
  pillActive: { backgroundColor: colors.primary },
  pillText: { color: colors.text, fontSize: 11, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#000',
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
});
