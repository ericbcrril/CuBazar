import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

export default StyleSheet.create({
  list: { padding: 16, gap: 10 },
  bubble: { maxWidth: "78%", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16 },
  mine: { alignSelf: "flex-end", backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirs: { alignSelf: "flex-start", backgroundColor: colors.surfaceAlt, borderBottomLeftRadius: 4 },
  bubbleText: { color: colors.text, fontSize: 14 },
  prompt: { paddingHorizontal: 16, paddingBottom: 10, alignItems: "center" },
  promptText: { color: colors.text, fontSize: 13, marginBottom: 8, textAlign: "center" },
  promptButtons: { flexDirection: "row", gap: 10 },
  thanks: { color: colors.muted, fontSize: 12, marginTop: 6 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.surface, color: colors.text, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: colors.border },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
});
