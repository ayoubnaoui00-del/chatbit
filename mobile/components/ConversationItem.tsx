import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Conversation } from '../types/conversation.types';
import { COLORS, RADIUS, SPACING } from '../utils/constants';
import { OnlineIndicator } from './OnlineIndicator';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
  currentUserId?: number | string;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onPress,
  currentUserId,
}: ConversationItemProps) => {
  const getStatusBadge = () => {
    switch (conversation.status) {
      case 'pending':
        return { label: 'Pending', bg: '#fef3c7', text: '#d97706' };
      case 'in_progress':
        return { label: 'In Progress', bg: '#dbeafe', text: '#2563eb' };
      case 'closed':
        return { label: 'Closed', bg: '#f3f4f6', text: '#6b7280' };
      default:
        return { label: conversation.status, bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const statusInfo = getStatusBadge();
  const title = conversation.subject || 'Support Request';

  // Display user name or client info
  const clientName = conversation.client?.fullname || conversation.client_name || `Customer #${conversation.clientid}`;
  const agentName = conversation.agent?.fullname || conversation.agent_name || 'Unassigned';

  // Format date
  const formattedTime = conversation.createdat
    ? new Date(conversation.createdat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {clientName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <OnlineIndicator isOnline={conversation.client?.isonline} size={12} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.time}>{formattedTime}</Text>
        </View>

        <Text style={styles.subtitle} numberOfLines={1}>
          Customer: {clientName} • Agent: {agentName}
        </Text>

        <View style={styles.footerRow}>
          <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.badgeText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
          </View>
          {!!conversation.unreadCount && conversation.unreadCount > 0 && (
            <View style={styles.unreadCounter}>
              <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.gutter,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: COLORS.onPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
    flex: 1,
    marginRight: SPACING.sm,
  },
  time: {
    fontSize: 12,
    color: COLORS.outline,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginBottom: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  unreadCounter: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: COLORS.onPrimary,
    fontSize: 11,
    fontWeight: '700',
  },
});
