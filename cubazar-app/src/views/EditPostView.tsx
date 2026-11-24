import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Button, Icon, Input } from "react-native-elements";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import AppHeader from "@/components/AppHeader";
import FeedbackState from "@/components/FeedbackState";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { createProduct, deleteProduct, getProduct, setProductSold, updateProduct, type ProductImageUpload } from "@/services/products";
import type { ApiProduct } from "@/types/api";
import { conditionLabel, conditionValue, normalizeImageUrl } from "@/utils/product";
import UserAvatar from "@/components/UserAvatar";
import ImageCollage from "@/components/ImageCollage";
import { deleteProductImage } from "@/services/products";
import { btn, common, input } from "@/styles/common";
import styles from "@/styles/editPostView";

// Sirve para crear (tab central) y para editar (/editar-publicacion?id=...)
export default function EditPostView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();

  const [descripcion, setDescripcion] = useState("");
  const [titulo, setTitulo] = useState("");
  const [precio, setPrecio] = useState("");
  const [condicion, setCondicion] = useState("");
  const [tipo, setTipo] = useState<"PUBLICACION" | "VENTA">("VENTA");
  const [existente, setExistente] = useState<ApiProduct | null>(null);
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const draftSavedRef = useRef(false);
  const draftStateRef = useRef({
    titulo: "",
    descripcion: "",
    precio: "",
    tipo: "VENTA" as "PUBLICACION" | "VENTA",
    condicion: "",
    selectedImages: [] as ImagePicker.ImagePickerAsset[],
  });
  useEffect(() => {
    draftStateRef.current = {
      titulo,
      descripcion,
      precio,
      tipo,
      condicion,
      selectedImages,
    };
  }, [titulo, descripcion, precio, tipo, condicion, selectedImages]);

  const saveDraft = useCallback(async (notify = true) => {
    if (id) return;
    const current = draftStateRef.current;
    const hasDraftContent =
      current.titulo.trim().length > 0 ||
      current.descripcion.trim().length > 0 ||
      current.precio.trim().length > 0 ||
      current.selectedImages.length > 0;
    if (!hasDraftContent || draftSavedRef.current) return;
    draftSavedRef.current = true;
    const numericPrice = current.tipo === "VENTA" ? Number(current.precio) || 0 : 0;
    const draftCondition = conditionValue(current.condicion) ?? "NUEVO";
    try {
      await createProduct({
          title: current.titulo.trim() || "Borrador sin título",
          description: current.descripcion.trim() || "Borrador pendiente de completar.",
          price: numericPrice,
          condition: draftCondition,
          type: current.tipo,
          status: "DRAFT",
        }, current.selectedImages.map((image) => ({
          uri: image.uri,
          mimeType: image.mimeType,
          fileName: image.fileName,
        })));
      draftSavedRef.current = true;
      if (notify) Alert.alert("Borrador creado", "Tu progreso se guardó en Borradores.");
    } catch (reason) {
      draftSavedRef.current = false;
      if (notify) Alert.alert("No se pudo guardar el borrador", reason instanceof Error ? reason.message : "Intenta de nuevo.");
      else console.warn("No se pudo guardar el borrador automáticamente.", reason instanceof Error ? reason.message : reason);
    }
  }, [id]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "background" || state === "inactive") void saveDraft(false);
    });
    return () => {
      subscription.remove();
      void saveDraft(true);
    };
  }, [saveDraft]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getProduct(id)
      .then((product) => {
        if (!active) return;
        setExistente(product);
        setTitulo(product.title);
        setDescripcion(product.description);
        setPrecio(String(product.price));
        setCondicion(conditionLabel(product.condition));
        setTipo(product.type);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar la publicación.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, loadAttempt]);

  const elegirImagen = async (origen: "Cámara" | "Galería") => {
    try {
      const permission =
        origen === "Cámara"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permiso requerido", `Permite el acceso a ${origen.toLowerCase()} para elegir una imagen.`);
        return;
      }

      const result =
        origen === "Cámara"
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.85 })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              quality: 0.85,
              allowsMultipleSelection: true,
              selectionLimit: 5,
            });
      if (result.canceled) return;

      const assets = result.assets;
      if (assets.some((asset) => !["image/jpeg", "image/png", "image/webp"].includes(asset.mimeType ?? ""))) {
        Alert.alert("Formato no compatible", "Elige una imagen JPEG, PNG o WebP.");
        return;
      }
      setSelectedImages((previous) => {
        const existingCount =
          (existente?.images?.filter((image) => !removedImageIds.includes(image.id ?? image._id ?? "")).length ?? 0);
        const available = Math.max(0, 5 - existingCount);
        const combined = [...previous, ...assets];
        if (combined.length > available) {
          Alert.alert(
            "Límite de 5 imágenes",
            `Solo puedes conservar ${available} imagen(es) nueva(s) además de las existentes.`,
          );
        }
        return combined.slice(0, available);
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo seleccionar la imagen.");
    }
  };

  const publicar = async () => {
    if (titulo.trim().length < 3) return setError("El título debe tener al menos 3 caracteres.");
    if (descripcion.trim().length < 10) return setError("La descripción debe tener al menos 10 caracteres.");
    const numericPrice = tipo === "VENTA" ? Number(precio) : 0;
    if (tipo === "VENTA" && (!precio || !Number.isFinite(numericPrice) || numericPrice < 0)) {
      return setError("Escribe un precio válido en MXN.");
    }
    let selectedCondition: ApiProduct["condition"] = "NUEVO";
    if (tipo === "VENTA") {
      const value = conditionValue(condicion);
      if (!value) return setError("Selecciona la condición del producto.");
      selectedCondition = value;
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        title: titulo.trim(),
        description: descripcion.trim(),
        price: numericPrice,
        condition: selectedCondition,
        type: tipo,
      };
      if (id) {
        await updateProduct(id, {
          ...payload,
          ...(existente?.status === "DRAFT" ? { status: "PUBLISHED" as const } : {}),
        }, selectedImages.map((image) => ({
          uri: image.uri,
          mimeType: image.mimeType,
          fileName: image.fileName,
        })));
        await Promise.all(removedImageIds.map((imageId) => deleteProductImage(id, imageId)));
      } else {
        const images: ProductImageUpload[] = selectedImages.map((image) => ({
          uri: image.uri,
          mimeType: image.mimeType,
          fileName: image.fileName,
        }));
        await createProduct({ ...payload, status: "PUBLISHED" }, images);
      }
      Alert.alert("Listo", id ? "Publicación actualizada." : "Publicación creada.");
      draftSavedRef.current = true;
      router.back();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo guardar la publicación.");
    } finally {
      setSubmitting(false);
    }
  };

  const eliminar = () => {
    if (!id) return;
    Alert.alert("Eliminar publicación", "Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => {
          setSubmitting(true);
          void deleteProduct(id)
            .then(() => router.back())
            .catch((reason: unknown) =>
              Alert.alert("No se pudo eliminar", reason instanceof Error ? reason.message : "Intenta de nuevo."),
            )
            .finally(() => setSubmitting(false));
        },
      },
    ]);
  };

  const cambiarEstadoVenta = async (sold: boolean) => {
    if (!id) return;
    setStatusUpdating(true);
    try {
      const product = await setProductSold(id, sold);
      setExistente(product);
      Alert.alert(
        sold ? "Vendida" : "Actualizado",
        sold ? "El producto quedó marcado como vendido sin eliminarse." : "La publicación volvió a estar disponible.",
      );
    } catch (reason) {
      Alert.alert("Error", reason instanceof Error ? reason.message : "No se pudo actualizar el estado.");
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <SafeAreaView style={common.screen} edges={["top"]}>
      <AppHeader
        title={id ? "Editar publicación" : "Publicación"}
        back={!!id}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={common.scroll} keyboardShouldPersistTaps="handled">
          {loading ? <ActivityIndicator color={colors.primary} /> : null}
          {id && !loading && !existente && error ? (
            <FeedbackState
              error={error}
              onRetry={() => {
                setError("");
                setLoading(true);
                setLoadAttempt((attempt) => attempt + 1);
              }}
            />
          ) : null}
          <View style={styles.author}>
            <UserAvatar uri={user?.profilePictureUrl} size={40} />
            <View>
              <Text style={styles.name}>{user?.fullName ?? ""}</Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{tipo === "VENTA" ? "Venta" : "Publicación"}</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            {([
              ["PUBLICACION", "Publicación"],
              ["VENTA", "Venta"],
            ] as const).map(([value, label]) => (
              <TouchableOpacity
                key={value}
                onPress={() => setTipo(value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: tipo === value }}
                style={[styles.tag, { minHeight: 44, justifyContent: "center", paddingHorizontal: 14, backgroundColor: tipo === value ? colors.primary : colors.surfaceAlt }]}
              >
                <Text style={[styles.tagText, { color: tipo === value ? "#fff" : colors.muted }]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.description}
            placeholder="Escribe una descripción para tu publicación..."
            placeholderTextColor={colors.muted}
            multiline
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {(() => {
            const existingUrls = (existente?.images ?? [])
              .filter((image) => !removedImageIds.includes(image.id ?? image._id ?? ""))
              .map((image) => normalizeImageUrl(image.imageUrl))
              .filter((url): url is string => Boolean(url));
            const selectedUrls = selectedImages.map((image) => image.uri);
            const previewUrls = [...existingUrls, ...selectedUrls].slice(0, 5);
            return previewUrls.length ? (
              <View style={{ marginBottom: 16 }}>
                <ImageCollage urls={previewUrls} height={190} />
              </View>
            ) : (
              <ImagePlaceholder height={190} style={{ marginBottom: 16 }} />
            );
          })()}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {(existente?.images ?? [])
              .filter((image) => !removedImageIds.includes(image.id ?? image._id ?? ""))
              .map((image, index) => {
                const imageId = image.id ?? image._id;
                return (
                  <TouchableOpacity
                    key={imageId ?? index}
                    onPress={() => imageId && setRemovedImageIds((previous) => [...previous, imageId])}
                    accessibilityRole="button"
                    accessibilityLabel={`Eliminar imagen ${index + 1}`}
                    style={{ minHeight: 44, justifyContent: "center", marginRight: 8, borderRadius: 14, backgroundColor: colors.surfaceAlt, paddingHorizontal: 10, paddingVertical: 7 }}
                  >
                    <Text style={{ color: colors.muted, fontSize: 12 }}>Imagen {index + 1} · eliminar</Text>
                  </TouchableOpacity>
                );
              })}
            {selectedImages.map((image, index) => (
              <TouchableOpacity
                key={`${image.uri}-${index}`}
                onPress={() => setSelectedImages((previous) => previous.filter((_, i) => i !== index))}
                accessibilityRole="button"
                accessibilityLabel={`Quitar imagen nueva ${index + 1}`}
                style={{ minHeight: 44, justifyContent: "center", marginRight: 8, borderRadius: 14, backgroundColor: colors.surfaceAlt, paddingHorizontal: 10, paddingVertical: 7 }}
              >
                <Text style={{ color: colors.muted, fontSize: 12 }}>Nueva {index + 1} · quitar</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input placeholder="Título" value={titulo} onChangeText={setTitulo} containerStyle={input.containerStyle} inputContainerStyle={input.inputContainerStyle} inputStyle={input.inputStyle} />
          {tipo === "VENTA" ? (
            <>
              <Input placeholder="Precio (MXN)" value={precio} onChangeText={setPrecio} keyboardType="numeric" containerStyle={input.containerStyle} inputContainerStyle={input.inputContainerStyle} inputStyle={input.inputStyle} />
              <TouchableOpacity style={styles.dropdown} onPress={() => setAbierto((a) => !a)}>
                <Text style={[styles.dropdownText, !condicion && { color: colors.muted }]}>{condicion || "Condición"}</Text>
                <Icon name={abierto ? "chevron-up" : "chevron-down"} type="ionicon" color={colors.muted} size={18} />
              </TouchableOpacity>
            </>
          ) : null}
          {tipo === "VENTA" && abierto && (
            <View style={styles.options}>
              {[
                "Nuevo",
                "Usado como nuevo",
                "Usado en buen estado",
                "Usado aceptable",
              ].map((c) => (
                <TouchableOpacity key={c} style={styles.option} onPress={() => { setCondicion(c); setAbierto(false); }}>
                  <Text style={styles.dropdownText}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={{ flexDirection: "row", gap: 10, paddingTop: 8, paddingBottom: Math.max(8, insets.bottom) }}>
            {id && existente?.status === "SOLD" ? (
              <Button
                title="Disponible"
                onPress={() => void cambiarEstadoVenta(false)}
                loading={statusUpdating}
                disabled={statusUpdating || submitting}
                containerStyle={{ flex: 1 }}
                buttonStyle={btn.secondary}
                titleStyle={btn.title}
              />
            ) : null}
            {id && existente && existente.status !== "SOLD" ? (
              <Button
                title="Marcar como vendido"
                onPress={() => void cambiarEstadoVenta(true)}
                loading={statusUpdating}
                disabled={statusUpdating || submitting}
                containerStyle={{ flex: 1 }}
                buttonStyle={btn.secondary}
                titleStyle={btn.title}
              />
            ) : null}
            {id ? (
              <Button
                title="Eliminar"
                onPress={eliminar}
                disabled={loading || submitting || statusUpdating || !existente}
                containerStyle={{ flex: 1 }}
                buttonStyle={btn.secondary}
                titleStyle={[btn.title, { color: colors.danger }]}
              />
            ) : null}
            <Button
              title={existente?.status === "DRAFT" ? "Publicar" : id ? "Guardar" : "Publicar"}
              onPress={() => void publicar()}
              loading={submitting}
              disabled={loading || submitting || statusUpdating || (Boolean(id) && !existente)}
              containerStyle={{ flex: 1 }}
              buttonStyle={btn.primary}
              titleStyle={btn.title}
            />
          </View>
        </ScrollView>

        <View style={[styles.toolbar, { paddingBottom: Math.max(12, insets.bottom) }]}>
          <TouchableOpacity
            onPress={() => void elegirImagen("Cámara")}
            style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}
            accessibilityRole="button"
            accessibilityLabel="Tomar foto"
          >
            <Icon name="camera-outline" type="ionicon" color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => void elegirImagen("Galería")}
            style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}
            accessibilityRole="button"
            accessibilityLabel="Elegir fotos de la galería"
          >
            <Icon name="image-outline" type="ionicon" color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert("Archivos", "Por ahora solo se pueden adjuntar imágenes desde cámara o galería.")}
            style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}
            accessibilityRole="button"
            accessibilityLabel="Adjuntar archivo"
          >
            <Icon name="document-outline" type="ionicon" color={colors.text} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
