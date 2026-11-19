import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

export const header = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  side: { minWidth: 56, flexDirection: "row", alignItems: "center" },
  right: { minWidth: 56, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 12 },
  title: { color: colors.text, fontSize: 17, fontWeight: "700" },
});

export const post = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { color: colors.text, fontWeight: "700", fontSize: 14 },
  muted: { color: colors.muted, fontSize: 11 },
  desc: { color: colors.text, fontSize: 13, marginTop: 8, lineHeight: 18 },
  tag: { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  tagText: { color: colors.text, fontSize: 10, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
});

export const product = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 8, marginRight: 12, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.text, fontWeight: "700", marginTop: 8, fontSize: 13 },
  muted: { color: colors.muted, fontSize: 11 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  price: { color: colors.primary, fontWeight: "800", fontSize: 14 },
});

export const imagePlaceholder = StyleSheet.create({
  box: { backgroundColor: colors.surfaceAlt, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
