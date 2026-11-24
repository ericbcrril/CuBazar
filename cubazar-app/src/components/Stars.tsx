import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "@/constants/theme";

type Props = { value?: number; size?: number; onChange?: (n: number) => void };

// Calificación de 5 estrellas (solo lectura si no se pasa onChange)
export default function Stars({ value = 0, size = 14, onChange }: Props) {
  return (
    <View style={{ flexDirection: "row" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          disabled={!onChange}
          onPress={() => onChange?.(n)}
          style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
          accessibilityRole="button"
          accessibilityLabel={`${n} estrellas`}
          accessibilityState={{ selected: n === value, disabled: !onChange }}
        >
          <Text style={{ fontSize: size, color: n <= value ? colors.star : colors.border }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
