import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

// Fila de menú (Cuenta y Acerca de)
export default StyleSheet.create({
  row: { minHeight: 52, flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  label: { flex: 1, color: colors.text, fontWeight: "700", fontSize: 14 },
});
