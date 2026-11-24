import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

export default StyleSheet.create({
  author: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  name: { color: colors.text, fontWeight: "700", fontSize: 14 },
  tag: { backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, alignSelf: "flex-start", marginTop: 2 },
  tagText: { color: colors.text, fontSize: 10, fontWeight: "700" },
  description: { color: colors.text, fontSize: 14, minHeight: 80, textAlignVertical: "top", marginBottom: 12 },
  dropdown: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 14, marginBottom: 12 },
  dropdownText: { color: colors.text, fontSize: 14 },
  option: { paddingVertical: 12, paddingHorizontal: 12 },
  options: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, marginTop: -8, marginBottom: 12 },
  toolbar: { flexDirection: "row", justifyContent: "center", gap: 28, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border },
  error: { color: colors.danger, fontSize: 13, lineHeight: 19, marginBottom: 10 },
});
