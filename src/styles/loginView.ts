import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

// Incluye las claves que ya usabas (container, containerStyle, inputContainerStyle,
// disabledInputStyle, labelStyle, inputStyle). Si ya tienes este archivo, fusiona los cambios.
export default StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  logo: { width: "100%", height: 90, marginVertical: 24 },
  tabs: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 999, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: "center" },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  tabTextActive: { color: colors.text },
  containerStyle: { paddingHorizontal: 0 },
  inputContainerStyle: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  disabledInputStyle: { opacity: 0.5 },
  labelStyle: { color: colors.muted, fontSize: 12, fontWeight: "400", marginBottom: 4 },
  inputStyle: { color: colors.text, fontSize: 14 },
  forgot: { color: colors.muted, fontSize: 12, textAlign: "right", marginBottom: 16 },
  error: { color: colors.primary, fontSize: 12, marginBottom: 10 },
  footerText: { color: colors.muted, textAlign: "center", marginTop: 16, fontSize: 13 },
  link: { color: colors.primary, fontWeight: "700" },
});
