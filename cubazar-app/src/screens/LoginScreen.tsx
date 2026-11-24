import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, common, radius, spacing } from '@/styles/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);

  const isRegister = mode === 'register';

  const submit = () => {
    router.push('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={common.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>
          CU<Text style={{ color: colors.primary }}>-</Text>bazar
        </Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, !isRegister && styles.tabActive]}
            onPress={() => setMode('login')}
          >
            <Text style={styles.tabText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, isRegister && styles.tabActive]}
            onPress={() => setMode('register')}
          >
            <Text style={styles.tabText}>Crear Cuenta</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Correo electrónico UdG</Text>
        <View style={styles.inputRow}>
          <Ionicons name="at" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="correo@alumnos.udg.mx"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.inputRow}>
          <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPass((s) => !s)}>
            <Ionicons name={showPass ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {isRegister ? (
          <>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPass}
                value={confirm}
                onChangeText={setConfirm}
              />
            </View>
          </>
        ) : (
          <TouchableOpacity style={{ alignSelf: 'flex-end' }}>
            <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[common.primaryBtn, styles.mt]} onPress={submit}>
          <Text style={common.primaryBtnText}>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[common.secondaryBtn, styles.googleBtn]} onPress={submit}>
          <Ionicons name="logo-google" size={16} color={colors.text} />
          <Text style={common.text}>Iniciar con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.footer} onPress={() => setMode(isRegister ? 'login' : 'register')}>
          <Text style={common.muted}>
            {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta aún? '}
            <Text style={styles.link}>{isRegister ? 'Inicia sesión' : 'Regístrate aquí'}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  logo: { color: colors.text, fontSize: 40, fontWeight: '800', textAlign: 'center', marginBottom: spacing.xl },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: 3,
    marginBottom: spacing.lg,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.surfaceAlt },
  tabText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  label: { color: colors.textMuted, fontSize: 11, marginBottom: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  input: { flex: 1, color: colors.text, paddingVertical: spacing.md, fontSize: 13 },
  link: { color: colors.primary, fontSize: 11 },
  mt: { marginTop: spacing.lg },
  googleBtn: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md },
  footer: { alignItems: 'center', marginTop: spacing.xl },
});
