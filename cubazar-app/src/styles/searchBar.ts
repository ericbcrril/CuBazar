import { StyleSheet } from "react-native";
import { colors } from "@/constants/theme";

// Props de <SearchBar> de react-native-elements (se usa en Explorar y Chats)
export default StyleSheet.create({
  container: { backgroundColor: "transparent", borderTopWidth: 0, borderBottomWidth: 0, paddingHorizontal: 12 },
  inputContainer: { backgroundColor: colors.surface, borderRadius: 999, borderWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  input: { color: colors.text, fontSize: 14 },
});
