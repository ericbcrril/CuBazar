import { useState } from "react";
import { Image } from "expo-image";
import { TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";

import { colors } from "@/constants/theme";
import { normalizeImageUrl } from "@/utils/product";

export default function UserAvatar({
  uri,
  size = 40,
  onPress,
}: {
  uri?: string | null;
  size?: number;
  onPress?: () => void;
}) {
  const imageUrl = normalizeImageUrl(uri);
  const [imageFailed, setImageFailed] = useState(false);
  const content = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surfaceAlt,
      }}
    >
      {imageUrl && !imageFailed ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size }}
          contentFit="cover"
          transition={180}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <Icon name="person" type="ionicon" size={Math.round(size * 0.55)} color={colors.muted} />
      )}
    </View>
  );
  return onPress ? (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Ver perfil"
      hitSlop={4}
    >
      {content}
    </TouchableOpacity>
  ) : content;
}
