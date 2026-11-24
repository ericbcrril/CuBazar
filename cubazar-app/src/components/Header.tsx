import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing } from '@/styles/theme';

type Props = {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  showActions?: boolean; // + , campana y burbuja de chats
  onMenuPress?: () => void;
};

export default function Header({
  title,
  showBack = false,
  showMenu = false,
  showActions = false,
  onMenuPress,
}: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color="#fff" />
          </TouchableOpacity>
        )}
        {showMenu && (
          <TouchableOpacity onPress={onMenuPress}>
            <Ionicons name="menu" size={26} color={colors.tabIcon} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {showActions && (
        <View style={styles.right}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/publicar')}>
            <Ionicons name="add-circle" size={24} color={colors.tabIcon} />
          </TouchableOpacity>
          <Ionicons name="notifications" size={22} color={colors.tabIcon} />
          <TouchableOpacity onPress={() => router.push('/(tabs)/actividad')}>
            <Ionicons name="chatbubble" size={22} color={colors.tabIcon} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bg,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { color: colors.text, fontSize: 16, fontWeight: '700' },
  backBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
