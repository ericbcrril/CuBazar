import { StyleProp, View, ViewStyle } from "react-native";
import { Icon } from "react-native-elements";

import { colors } from "@/constants/theme";
import { imagePlaceholder as styles } from "@/styles/components";

// Mientras no haya fotos reales, se muestra este recuadro. Cambia por <Image source={{ uri }} />
export default function ImagePlaceholder({ height = 140, style }: { height?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.box, { height }, style]}>
      <Icon name="image-outline" type="ionicon" color={colors.muted} size={28} />
    </View>
  );
}
