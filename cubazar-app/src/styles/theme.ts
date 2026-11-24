import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

export { colors, radius, spacing };

export const common = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '700' },
  text: { color: colors.text, fontSize: 14 },
  muted: { color: colors.textMuted, fontSize: 12 },
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    minHeight: 48,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.primaryText, fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    minHeight: 48,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
});
