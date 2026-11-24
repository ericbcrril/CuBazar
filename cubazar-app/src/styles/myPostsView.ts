import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

export default StyleSheet.create({
  summary: { color: colors.muted, fontSize: 13, paddingHorizontal: 16, marginBottom: 12 },
  bold: { color: colors.text, fontWeight: "700" },
  tabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border, marginHorizontal: 16, marginBottom: 12 },
  tab: { flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center", paddingVertical: 10 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  tabTextActive: { color: colors.text },
  grid: { paddingHorizontal: 12, paddingBottom: 32 },
  cell: { flex: 1, margin: 4 },
  label: { position: "absolute", left: 8, bottom: 8, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  labelText: { color: colors.text, fontSize: 11, fontWeight: "700" },
  empty: { color: colors.muted, textAlign: "center", marginTop: 32 },
});
