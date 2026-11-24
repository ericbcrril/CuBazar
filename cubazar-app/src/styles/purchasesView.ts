import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

export default StyleSheet.create({
  item: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  info: { flex: 1 },
  title: { color: colors.text, fontWeight: "700", fontSize: 14 },
  muted: { color: colors.muted, fontSize: 11, marginTop: 2 },
  total: { color: colors.accent, fontWeight: "800", fontSize: 14 },
});
