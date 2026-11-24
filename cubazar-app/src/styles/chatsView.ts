import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

export default StyleSheet.create({
  filters: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  chip: { minHeight: 44, justifyContent: "center", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  chipTextActive: { color: colors.text },
  item: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  name: { color: colors.text, fontWeight: "700", fontSize: 14 },
  last: { color: colors.muted, fontSize: 12, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
