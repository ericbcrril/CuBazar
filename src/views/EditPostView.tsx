import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Avatar, Button, Icon, Input } from "react-native-elements";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import AppHeader from "@/components/AppHeader";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { colors } from "@/constants/theme";
import { condiciones, currentUser, misPublicaciones } from "@/data/mock";
import { btn, common, input } from "@/styles/common";
import styles from "@/styles/editPostView";

// Sirve para crear (tab central) y para editar (/editar-publicacion?id=...)
export default function EditPostView() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existente = misPublicaciones.publicadas.find((p) => p.id === id);

  const [descripcion, setDescripcion] = useState("");
  const [titulo, setTitulo] = useState(existente?.titulo ?? "");
  const [precio, setPrecio] = useState(existente ? String(existente.precio) : "");
  const [condicion, setCondicion] = useState(existente?.condicion ?? "");
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState("");

  // TODO: instala expo-image-picker y abre la cámara/galería aquí
  const elegirImagen = (origen: string) => Alert.alert(origen, "Pendiente: integrar expo-image-picker");

  const publicar = () => {
    if (!titulo.trim()) return setError("Escribe un título.");
    if (!precio || isNaN(Number(precio))) return setError("Escribe un precio válido en MXN.");
    if (!condicion) return setError("Selecciona la condición del producto.");
    setError("");
    // TODO: POST /publicaciones (o PUT si hay id) a tu API
    Alert.alert("Listo", existente ? "Publicación actualizada." : "Publicación creada.");
    if (existente) {
      router.back();
    } else {
      setDescripcion("");
      setTitulo("");
      setPrecio("");
      setCondicion("");
      router.navigate("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <AppHeader
        title={existente ? "Editar publicación" : "Publicación"}
        back={!!existente}
        right={<Button title={existente ? "Guardar" : "Publicar"} onPress={publicar} buttonStyle={[btn.primary, { paddingVertical: 6, paddingHorizontal: 16 }]} titleStyle={[btn.title, { fontSize: 13 }]} />}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={common.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.author}>
            <Avatar rounded size={40} icon={{ name: "person", type: "ionicon" }} containerStyle={{ backgroundColor: colors.surfaceAlt }} />
            <View>
              <Text style={styles.name}>{currentUser.nombre}</Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Venta</Text>
              </View>
            </View>
          </View>

          <TextInput
            style={styles.description}
            placeholder="Escribe una descripción para tu publicación..."
            placeholderTextColor={colors.muted}
            multiline
            value={descripcion}
            onChangeText={setDescripcion}
          />

          <ImagePlaceholder height={190} style={{ marginBottom: 16 }} />

          <Input placeholder="Título" value={titulo} onChangeText={setTitulo} containerStyle={input.containerStyle} inputContainerStyle={input.inputContainerStyle} inputStyle={input.inputStyle} />
          <Input placeholder="Precio (MXN)" value={precio} onChangeText={setPrecio} keyboardType="numeric" containerStyle={input.containerStyle} inputContainerStyle={input.inputContainerStyle} inputStyle={input.inputStyle} />

          <TouchableOpacity style={styles.dropdown} onPress={() => setAbierto((a) => !a)}>
            <Text style={[styles.dropdownText, !condicion && { color: colors.muted }]}>{condicion || "Condición"}</Text>
            <Icon name={abierto ? "chevron-up" : "chevron-down"} type="ionicon" color={colors.muted} size={18} />
          </TouchableOpacity>
          {abierto && (
            <View style={styles.options}>
              {condiciones.map((c) => (
                <TouchableOpacity key={c} style={styles.option} onPress={() => { setCondicion(c); setAbierto(false); }}>
                  <Text style={styles.dropdownText}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.toolbar}>
          <Icon name="camera-outline" type="ionicon" color={colors.text} onPress={() => elegirImagen("Cámara")} />
          <Icon name="image-outline" type="ionicon" color={colors.text} onPress={() => elegirImagen("Galería")} />
          <Icon name="document-outline" type="ionicon" color={colors.text} onPress={() => elegirImagen("Archivo")} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
