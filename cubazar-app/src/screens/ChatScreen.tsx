import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import { colors, common, radius, spacing } from '@/styles/theme';

type Message = { id: string; text: string; mine: boolean };

// Flujo de calificación: se habilita solo cuando ambas partes confirman la operación.
type Step = 'ask' | 'rate' | 'done';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hola, ¿sigue disponible?', mine: false },
    { id: '2', text: 'Sí, lo entrego en la biblioteca', mine: true },
  ]);
  const [text, setText] = useState('');
  const [step, setStep] = useState<Step>('ask');
  const [stars, setStars] = useState(0);

  const send = () => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: String(Date.now()), text: text.trim(), mine: true }]);
    setText('');
  };

  return (
    <View style={common.screen}>
      <Header title="Chat" showBack />

      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.mine ? styles.mine : styles.other]}>
            <Text style={common.text}>{item.text}</Text>
          </View>
        )}
      />

      {step === 'ask' && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>¿Le has comprado algo a este vendedor?</Text>
          <View style={styles.answers}>
            <TouchableOpacity style={[styles.answerBtn, { backgroundColor: colors.primary }]} onPress={() => setStep('rate')}>
              <Text style={common.primaryBtnText}>Sí</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.answerBtn, { backgroundColor: colors.surfaceAlt }]} onPress={() => setStep('done')}>
              <Text style={common.primaryBtnText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === 'rate' && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>¿Qué calificación le das a este vendedor?</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => {
                  setStars(n);
                  setStep('done');
                }}
              >
                <Ionicons name={n <= stars ? 'star' : 'star-outline'} size={36} color={colors.star} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje"
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          onSubmitEditing={send}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={send}>
          <Ionicons name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '75%', padding: spacing.md, borderRadius: radius.md },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.bubbleMine },
  other: { alignSelf: 'flex-start', backgroundColor: colors.bubbleOther },
  panel: { backgroundColor: colors.surface, padding: spacing.lg, alignItems: 'center' },
  panelTitle: { color: colors.text, fontSize: 12, fontWeight: '600', marginBottom: spacing.sm },
  answers: { flexDirection: 'row', gap: spacing.md },
  answerBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  stars: { flexDirection: 'row', gap: spacing.sm },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.bg },
  input: { flex: 1, backgroundColor: colors.surface, color: colors.text, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
