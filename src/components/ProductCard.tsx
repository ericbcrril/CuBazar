import { Text, TouchableOpacity, View } from "react-native";

import { product as styles } from "@/styles/components";
import { money } from "@/utils/format";
import ImagePlaceholder from "./ImagePlaceholder";
import Stars from "./Stars";

type Item = { id: string; titulo: string; precio: number; autor: string; estrellas: number };

export default function ProductCard({ item, onPress, width = 150 }: { item: Item; onPress?: () => void; width?: number }) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.card, { width }]}>
      <ImagePlaceholder height={96} />
      <Text style={styles.title}>{item.titulo}</Text>
      <Text style={styles.muted}>{item.autor}</Text>
      <View style={styles.footer}>
        <Text style={styles.price}>{money(item.precio)}</Text>
        <Stars value={item.estrellas} size={11} />
      </View>
    </TouchableOpacity>
  );
}
