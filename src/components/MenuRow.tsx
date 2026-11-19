import { Text, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";

import { colors } from "@/constants/theme";
import styles from "@/styles/menuRow";

export default function MenuRow({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <Icon name={icon} type="ionicon" color={colors.text} size={22} />
      <Text style={styles.label}>{label}</Text>
      <Icon name="chevron-forward" type="ionicon" color={colors.muted} size={20} />
    </TouchableOpacity>
  );
}
