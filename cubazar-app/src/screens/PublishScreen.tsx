import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, common, radius, spacing } from '@/styles/theme';

const conditions = ['Nuevo', 'Usado', 'Reacondicionado'];
const placeholderImage = require('../assets/images/download.jpg');

export default function PublishScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [photo, setPhoto] = useState<ImageSourcePropType | null>(placeholderImage);
  const [pickerOpen, setPickerOpen] = useState(false);

  const publish = () => {
    router.back();
  };

  const saveDraft = () => {
    router.back();
  };

  const pickImage = () => {
    setPhoto(placeholderImage);
  };

  return (
    <View style={common.screen}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={styles.top}>
          <TouchableOpacity style={styles.backBtn} onPress={saveDraft}>
            <Ionicons name="chevron-back" size={16} color="#fff" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={18} color="#fff" />
            </View>
            <View>
              <Text style={common.title}>Usuario 0</Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <Text style={styles.tag}>Venta</Text>
                <Text style={[styles.tag, { backgroundColor: colors.surfaceAlt }]}>Publicación</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.publishBtn} onPress={publish}>
            <Text style={common.primaryBtnText}>Publicar ›</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.descInput}
          placeholder="Escribe una descripción para tu publicación..."
          placeholderTextColor={colors.textMuted}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {photo ? (
          <Image source={photo} style={styles.photo} />
        ) : (
          <TouchableOpacity style={[styles.photo, styles.photoEmpty]} onPress={pickImage}>
            <Ionicons name="image-outline" size={40} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        <TextInput
          style={common.input}
          placeholder="Título"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={common.input}
          placeholder="Precio (MXN)"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />
        <TouchableOpacity style={[common.input, styles.select]} onPress={() => setPickerOpen(true)}>
          <Text style={{ color: condition ? colors.text : colors.textMuted }}>{condition || 'Condición'}</Text>
          <Ionicons name="chevron-down" size={18} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.mediaBar}>
          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="camera" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="image" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="document-text" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal transparent visible={pickerOpen} animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalCard}>
            {conditions.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.modalItem}
                onPress={() => {
                  setCondition(c);
                  setPickerOpen(false);
                }}
              >
                <Text style={common.text}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, marginLeft: spacing.md },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  tag: { backgroundColor: colors.primary, color: '#fff', fontSize: 9, paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.pill, overflow: 'hidden' },
  publishBtn: { backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  descInput: { color: colors.text, minHeight: 40, fontSize: 12 },
  photo: { width: '100%', height: 200, borderRadius: radius.md },
  photoEmpty: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  select: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mediaBar: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: spacing.xl },
  modalCard: { backgroundColor: colors.surface, borderRadius: radius.md },
  modalItem: { padding: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
});
