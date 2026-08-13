import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/Button';
import { COLORS, RADIUS, SPACING } from '../../utils/constants';
import { BottomNavBar } from '../../components/BottomNavBar';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.largeAvatar}>
            <Text style={styles.largeAvatarText}>
              {user?.fullname?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.fullname}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>
              {user?.role === 'agent' ? 'Agent Support Souq Express' : 'Client Souq Express'}
            </Text>
          </View>
        </View>

        {/* Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations du Compte</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID Utilisateur</Text>
            <Text style={styles.detailValue}>#{user?.id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Rôle</Text>
            <Text style={styles.detailValue}>
              {user?.role === 'agent' ? 'Support Agent' : 'Client'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Statut Réseau</Text>
            <Text style={[styles.detailValue, { color: COLORS.online }]}>En Ligne</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Se Déconnecter"
            variant="danger"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeTab="profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    padding: SPACING.gutter,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  largeAvatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.onPrimary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  roleTag: {
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  roleTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  section: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceContainer,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  actionsSection: {
    marginTop: SPACING.md,
  },
});
