import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { COLORS, RADIUS, SPACING } from '../../utils/constants';
import { Role } from '../../types/auth.types';

const logoImg = require('../../pictures/chatbit_logo.png');

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('client');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!fullname || !email || !password) {
      setErrorMsg('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await register({ fullname, email, password, role });
      router.replace('/(app)/conversations');
    } catch (err: any) {
      console.error('Register error:', err);
      const msg = err.response?.data?.message || 'Erreur lors de l\'inscription';
      setErrorMsg(msg);
      Alert.alert('Inscription échouée', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Image source={logoImg} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.brandTitle}>Créer un compte</Text>
            <Text style={styles.brandSubtitle}>Rejoignez le chat support Souq Express</Text>
          </View>

          {/* Role Toggle Switcher */}
          <View style={styles.roleToggleContainer}>
            <TouchableOpacity
              style={[styles.roleOption, role === 'client' && styles.roleOptionActive]}
              onPress={() => setRole('client')}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleOptionText, role === 'client' && styles.roleOptionTextActive]}>
                Client
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleOption, role === 'agent' && styles.roleOptionActive]}
              onPress={() => setRole('agent')}
              activeOpacity={0.8}
            >
              <Text style={[styles.roleOptionText, role === 'agent' && styles.roleOptionTextActive]}>
                Agent Support
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {!!errorMsg && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <Input
              label="Nom Complet"
              placeholder="Ex: Karim Benali"
              value={fullname}
              onChangeText={setFullname}
            />

            <Input
              label="Adresse Email"
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="Mot de Passe"
              placeholder="••••••••"
              isPassword
              value={password}
              onChangeText={setPassword}
            />

            <Button
              title={loading ? 'Création...' : "S'inscrire"}
              onPress={handleRegister}
              loading={loading}
              style={styles.submitBtn}
            />

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push('/(auth)/login')}
            >
              <Text style={styles.loginText}>
                Déjà un compte ?{' '}
                <Text style={styles.loginTextHighlight}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.gutter,
    paddingVertical: SPACING.xl,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    padding: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: RADIUS.full,
    padding: 4,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleOptionActive: {
    backgroundColor: COLORS.primaryContainer,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  roleOptionTextActive: {
    color: COLORS.onPrimary,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: COLORS.errorContainer,
    padding: SPACING.md,
    borderRadius: RADIUS.default,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.onErrorContainer,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: SPACING.sm,
  },
  loginLink: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  loginTextHighlight: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
