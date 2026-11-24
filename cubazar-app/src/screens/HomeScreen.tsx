import React from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';
import { colors, common, radius, spacing } from '@/styles/theme';

type Post = { id: string; author: string; time: string; text: string; image: ImageSourcePropType };
const postImage = require('../assets/images/download.jpg');

const posts: Post[] = [
  {
    id: '1',
    author: 'Chico de la compus',
    time: 'Publicado hace 47 min',
    text: 'Vendo laptop en excelente estado, ideal para la carrera. Entrego en CUCEI.',
    image: postImage,
  },
  {
    id: '2',
    author: 'Ana del CUCEA',
    time: 'Publicado hace 2 h',
    text: 'Calculadora científica casi nueva, precio negociable.',
    image: postImage,
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={common.screen}>
      <Header title="Inicio" showMenu showActions />
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        ListHeaderComponent={
          <TouchableOpacity style={styles.publishBar} onPress={() => router.push('/(tabs)/publicar')}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={16} color="#fff" />
            </View>
            <TextInput
              editable={false}
              pointerEvents="none"
              placeholder="Publica algo..."
              placeholderTextColor={colors.textMuted}
              style={styles.publishInput}
            />
          </TouchableOpacity>
        }
        renderItem={({ item }) => <PostCard post={item} />}
      />
    </View>
  );
}

function PostCard({ post }: { post: Post }) {
  return (
    <View style={styles.post}>
      <View style={[common.row, { gap: spacing.sm, padding: spacing.md }]}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={16} color="#fff" />
        </View>
        <View>
          <Text style={common.title}>{post.author}</Text>
          <Text style={common.muted}>{post.time}</Text>
        </View>
      </View>
      <Text style={[common.text, { paddingHorizontal: spacing.md, marginBottom: spacing.sm }]}>{post.text}</Text>
      <Image source={post.image} style={styles.postImage} />
      <View style={styles.postActions}>
        <TouchableOpacity style={common.row}>
          <Ionicons name="thumbs-up" size={16} color={colors.textMuted} />
          <Text style={[common.muted, { marginLeft: 4 }]}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={common.row}>
          <Ionicons name="chatbubble" size={16} color={colors.textMuted} />
          <Text style={[common.muted, { marginLeft: 4 }]}>Comentarios</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  publishBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  publishInput: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  post: { backgroundColor: colors.surface, borderRadius: radius.md, overflow: 'hidden' },
  postImage: { width: '100%', height: 220, backgroundColor: colors.surfaceAlt },
  postActions: { flexDirection: 'row', justifyContent: 'space-between', padding: spacing.md },
});
