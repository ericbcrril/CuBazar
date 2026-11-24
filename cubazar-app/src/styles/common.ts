import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

// Estilos compartidos por todas las vistas
export const common = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "700", marginBottom: 10, marginTop: 8 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  row: { flexDirection: "row", alignItems: "center" },
});

// Props de <Input> de react-native-elements
export const input = StyleSheet.create({
  containerStyle: { paddingHorizontal: 0 },
  inputContainerStyle: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  inputStyle: { color: colors.text, fontSize: 14 },
  labelStyle: { color: colors.muted, fontSize: 12, fontWeight: "400", marginBottom: 4 },
});

// Props de <Button> de react-native-elements
export const btn = StyleSheet.create({
  container: { borderRadius: 999, marginBottom: 10 },
  primary: { backgroundColor: colors.primary, borderRadius: 999, minHeight: 48, paddingVertical: 12 },
  secondary: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    minHeight: 48,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontWeight: "700", fontSize: 14, color: colors.text },
});
