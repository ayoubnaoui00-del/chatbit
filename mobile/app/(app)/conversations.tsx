import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useConversations } from '../../hooks/useConversations';
import { ConversationItem } from '../../components/ConversationItem';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { COLORS, RADIUS, SPACING } from '../../utils/constants';
import { ConversationStatus } from '../../types/conversation.types';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import DesktopChatView from './desktop';
import { BottomNavBar } from '../../components/BottomNavBar';

export default function ConversationsScreen() {
  const { isDesktop } = useResponsiveLayout();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const {
    conversations,
    isLoading,
    refetch,
    createConversation,
    isCreating,
  } = useConversations();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [subject, setSubject] = useState('');
  const [createError, setCreateError] = useState('');

  // Configure Navigation Header Right Button (Profile)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.profileHeaderBtn}
          onPress={() => router.push('/(app)/profile')}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.fullname?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, user]);

  const handleCreateTicket = async () => {
    if (!subject.trim()) {
      setCreateError('Veuillez entrer un sujet pour la conversation');
      return;
    }

    try {
      setCreateError('');
      const newConv = await createConversation({ subject: subject.trim() });
      setSubject('');
      setModalVisible(false);
      router.push(`/(app)/conversation/${newConv.id}`);
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.status === activeFilter;
  });

  const isAgent = user?.role === 'agent';

  // If on Desktop viewport, render split-pane view
  if (isDesktop) {
    return <DesktopChatView />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Role Banner / Subtitle */}
      <View style={styles.roleBanner}>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {isAgent ? '🎧 Agent Support' : '🛍️ Client Souq Express'}
          </Text>
        </View>
        <Text style={styles.welcomeText}>Bonjour, {user?.fullname}</Text>
      </View>

      {/* Agent Filter Tabs */}
      {isAgent && (
        <View style={styles.filterContainer}>
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'en_attente', label: 'En attente' },
            { key: 'en_cours', label: 'En cours' },
            { key: 'fermee', label: 'Fermées' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                activeFilter === filter.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter.key && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* List */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyTitle}>Aucune conversation</Text>
          <Text style={styles.emptySubtitle}>
            {isAgent
              ? 'Aucun ticket ne correspond à ce filtre.'
              : "Vous n'avez pas encore de demande de support active."}
          </Text>
          {!isAgent && (
            <Button
              title="+ Nouvelle demande support"
              onPress={() => setModalVisible(true)}
              style={styles.emptyCreateBtn}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }: any) => (
            <ConversationItem
              conversation={item}
              currentUserId={user?.id}
              onPress={() => router.push(`/(app)/conversation/${item.id}`)}
            />
          )}
          refreshControl={
            (
              <RefreshControl refreshing={isLoading} onRefresh={refetch} colors={[COLORS.primary]} />
            ) as any
          }
        /> as any
      )}

      {/* Client Floating Action Button */}
      {!isAgent && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {/* Create Ticket Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nouvelle demande de support</Text>
            <Text style={styles.modalSubtitle}>
              Décrivez brièvement le sujet de votre problème (ex: Suivi de commande, Retour).
            </Text>

            {!!createError && (
              <View style={styles.modalErrorContainer}>
                <Text style={styles.modalErrorText}>{createError}</Text>
              </View>
            )}

            <Input
              label="Sujet"
              placeholder="Ex: Problème de livraison commande #4092"
              value={subject}
              onChangeText={setSubject}
            />

            <View style={styles.modalActions}>
              <Button
                title="Annuler"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={styles.modalBtn}
              />
              <Button
                title={isCreating ? 'Création...' : 'Créer'}
                onPress={handleCreateTicket}
                loading={isCreating}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={activeFilter === 'fermee' ? 'history' : 'chat'}
        onSelectTab={(tab) => {
          if (tab === 'chat') setActiveFilter('all');
          if (tab === 'history') setActiveFilter('fermee');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  roleBanner: {
    paddingHorizontal: SPACING.gutter,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.gutter,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  filterChipActive: {
    backgroundColor: COLORS.primaryContainer,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: COLORS.onPrimary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyCreateBtn: {
    minWidth: 200,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    color: COLORS.onPrimary,
    fontSize: 28,
    fontWeight: '300',
  },
  profileHeaderBtn: {
    paddingRight: SPACING.sm,
  },
  profileAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    color: COLORS.onPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.gutter,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.lg,
  },
  modalErrorContainer: {
    backgroundColor: COLORS.errorContainer,
    padding: SPACING.sm,
    borderRadius: RADIUS.default,
    marginBottom: SPACING.md,
  },
  modalErrorText: {
    color: COLORS.onErrorContainer,
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  modalBtn: {
    flex: 1,
  },
});
