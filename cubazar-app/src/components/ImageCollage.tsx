import { Image, Text, View } from "react-native";
import { colors } from "@/constants/theme";

export default function ImageCollage({
  urls,
  height = 190,
}: {
  urls: string[];
  height?: number;
}) {
  const images = urls.filter(Boolean).slice(0, 5);
  if (!images.length) return null;
  if (images.length === 1) {
    return (
      <Image
        source={{ uri: images[0] }}
        style={{ width: "100%", height, borderRadius: 10, backgroundColor: colors.surfaceAlt }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={{ width: "100%", height, flexDirection: "row", gap: 4 }}>
      <View style={{ flex: images.length === 2 ? 1 : 1.35 }}>
        <Image source={{ uri: images[0] }} style={{ width: "100%", height, borderRadius: 10 }} resizeMode="cover" />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        {images.slice(1, images.length === 2 ? 2 : 3).map((uri, index) => (
          <View key={`${uri}-${index}`} style={{ flex: 1 }}>
            <Image source={{ uri }} style={{ width: "100%", height: "100%", borderRadius: 8 }} resizeMode="cover" />
          </View>
        ))}
      </View>
      {images.length >= 4 ? (
        <View style={{ flex: 0.9, gap: 4 }}>
          {images.slice(3, 5).map((uri, index) => (
            <View key={`${uri}-${index}`} style={{ flex: 1 }}>
              <Image source={{ uri }} style={{ width: "100%", height: "100%", borderRadius: 8 }} resizeMode="cover" />
              {index === 1 && images.length === 5 ? (
                <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, borderRadius: 8, backgroundColor: "rgba(0,0,0,.42)", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>5 fotos</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
