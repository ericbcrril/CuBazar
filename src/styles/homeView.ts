import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

export default StyleSheet.create({
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 16,
  },
  composerText: { color: colors.muted, fontSize: 14 },
});
