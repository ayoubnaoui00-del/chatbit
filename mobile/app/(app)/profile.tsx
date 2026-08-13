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
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
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
              {user?.role === 'agent' ? 'Souq Express Support Agent' : 'Souq Express Customer'}
            </Text>
          </View>
        </View>

        {/* Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>User ID</Text>
            <Text style={styles.detailValue}>#{user?.id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Role</Text>
            <Text style={styles.detailValue}>
              {user?.role === 'agent' ? 'Support Agent' : 'Customer'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Network Status</Text>
            <Text style={[styles.detailValue, { color: COLORS.online }]}>Online</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Sign Out"
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
