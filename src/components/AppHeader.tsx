import { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";
import { useRouter } from "expo-router";

import { colors } from "@/constants/theme";
import { header as styles } from "@/styles/components";

type Props = {
  title: string;
  back?: boolean; // muestra la flecha para regresar
  left?: ReactNode;
  right?: ReactNode;
};

export default function AppHeader({ title, back, left, right }: Props) {
  const router = useRouter();
  return (
    <View style={styles.bar}>
      <View style={styles.side}>
        {back ? (
          <TouchableOpacity onPress={() => router.back()}>
            <Icon name="chevron-back" type="ionicon" color={colors.text} />
          </TouchableOpacity>
        ) : (
          left
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}
