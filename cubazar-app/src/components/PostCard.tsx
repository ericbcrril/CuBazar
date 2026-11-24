import { Text, TouchableOpacity, View } from "react-native";
import { Icon } from "react-native-elements";

import { colors } from "@/constants/theme";
import { post as styles } from "@/styles/components";
import ImageCollage from "./ImageCollage";
import ImagePlaceholder from "./ImagePlaceholder";
import { money } from "@/utils/format";
import UserAvatar from "./UserAvatar";
import { useRouter } from "expo-router";

type Post = {
  autor: string;
  tipo: string;
  hace: string;
  title?: string;
  descripcion: string;
  likes: number;
  comentarios: number;
  liked?: boolean;
  imageUrls?: string[];
  precio?: number;
  condicion?: string;
  sellerId?: string;
  sellerAvatar?: string | null;
};

export default function PostCard({
  post,
  onPress,
  onLike,
}: {
  post: Post;
  onPress?: () => void;
  onLike?: () => void;
}) {
  const router = useRouter();
  const imageUrls = post.imageUrls ?? [];
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.8 : 1}>
      <View style={styles.row}>
        <UserAvatar
          uri={post.sellerAvatar}
          size={40}
          onPress={post.sellerId ? () => router.push({ pathname: "/user/[id]", params: { id: post.sellerId! } }) : undefined}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Text style={styles.name}>{post.autor}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{post.tipo}</Text>
            </View>
          </View>
          <Text style={styles.muted}>{post.hace}</Text>
        </View>
      </View>
      {post.title ? <Text style={styles.title}>{post.title}</Text> : null}
      {post.descripcion ? <Text style={styles.desc}>{post.descripcion}</Text> : null}
      {post.tipo === "Venta" ? (
        <View style={{ marginTop: 8, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: colors.text, fontWeight: "700" }}>{money(post.precio ?? 0)} MXN</Text>
          {post.condicion ? <Text style={{ color: colors.muted, fontSize: 12, flexShrink: 1, textAlign: "right" }}>{post.condicion}</Text> : null}
        </View>
      ) : null}
      {imageUrls.length ? (
        <View style={{ marginVertical: 10 }}>
          <ImageCollage urls={imageUrls} height={170} />
        </View>
      ) : (
        <ImagePlaceholder height={170} style={{ marginVertical: 10 }} />
      )}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.action}
          onPress={onLike}
          disabled={!onLike}
          accessibilityRole="button"
          accessibilityLabel={`${post.liked ? "Quitar me gusta" : "Dar me gusta"}; ${post.likes} likes`}
          hitSlop={4}
        >
          <Icon name={post.liked ? "heart" : "heart-outline"} type="ionicon" color={post.liked ? colors.danger : colors.muted} size={16} />
          <Text style={styles.muted}> {post.likes} Like</Text>
        </TouchableOpacity>
        <View style={[styles.action, { justifyContent: "flex-end" }]}>
          <Icon name="chatbubble-outline" type="ionicon" color={colors.muted} size={16} />
          <Text style={styles.muted}> {post.comentarios} Comentarios</Text>
        </View>
      </View>
      </TouchableOpacity>
  );
}
