import { Text, View } from "react-native";
import { Avatar, Icon } from "react-native-elements";

import { colors } from "@/constants/theme";
import { post as styles } from "@/styles/components";
import ImagePlaceholder from "./ImagePlaceholder";

type Post = {
  autor: string;
  tipo: string;
  hace: string;
  descripcion: string;
  likes: number;
  comentarios: number;
};

export default function PostCard({ post }: { post: Post }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Avatar rounded size={40} icon={{ name: "person", type: "ionicon" }} containerStyle={{ backgroundColor: colors.surfaceAlt }} />
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
      <Text style={styles.desc}>{post.descripcion}</Text>
      <ImagePlaceholder height={170} style={{ marginVertical: 10 }} />
      <View style={styles.footer}>
        <View style={styles.row}>
          <Icon name="heart-outline" type="ionicon" color={colors.muted} size={16} />
          <Text style={styles.muted}> {post.likes} Like</Text>
        </View>
        <View style={styles.row}>
          <Icon name="chatbubble-outline" type="ionicon" color={colors.muted} size={16} />
          <Text style={styles.muted}> {post.comentarios} Comentarios</Text>
        </View>
      </View>
    </View>
  );
}
