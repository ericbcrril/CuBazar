import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { colors, spacing } from "@/constants/theme";

type Props = {
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function FeedbackState({ loading = false, error, onRetry, style }: Props) {
  if (!loading && !error) return null;

  return (
    <View style={[styles.container, style]}>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? (
        <>
          <Text accessibilityRole="alert" style={styles.message}>{error}</Text>
          {onRetry ? (
            <TouchableOpacity
              onPress={onRetry}
              style={styles.retry}
              accessibilityRole="button"
              accessibilityLabel="Reintentar"
            >
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.md, gap: spacing.xs },
  message: { color: colors.muted, fontSize: 13, lineHeight: 19, textAlign: "center" },
  retry: { minHeight: 44, justifyContent: "center", paddingHorizontal: spacing.lg },
  retryText: { color: colors.text, fontSize: 14, fontWeight: "700" },
});
