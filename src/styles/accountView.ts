import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

export default StyleSheet.create({
  profile: { alignItems: "center", marginVertical: 24 },
  name: { color: colors.text, fontSize: 18, fontWeight: "700", marginTop: 12 },
  email: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
