import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types/message.types';
import { COLORS, RADIUS, SPACING } from '../utils/constants';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
}: MessageBubbleProps) => {
  const formattedTime = message.sentat
    ? new Date(message.sentat).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const senderDisplayName = message.sender_name || message.sender?.fullname;

  return (
    <View style={[styles.wrapper, isCurrentUser ? styles.userWrapper : styles.otherWrapper]}>
      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.userBubble : styles.otherBubble,
        ]}
      >
        {!isCurrentUser && !!senderDisplayName && (
          <Text style={styles.senderName}>{senderDisplayName}</Text>
        )}
        <Text style={[styles.content, isCurrentUser ? styles.userContent : styles.otherContent]}>
          {message.content}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.time, isCurrentUser ? styles.userTime : styles.otherTime]}>
            {formattedTime}
          </Text>
          {isCurrentUser && (
            <Text style={styles.readStatus}>
              {message.isread ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginVertical: 4,
    paddingHorizontal: SPACING.gutter,
    flexDirection: 'row',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  otherWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: SPACING.paddingBubbleVertical,
    paddingHorizontal: SPACING.paddingBubbleHorizontal,
    borderRadius: RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: COLORS.primaryContainer,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderBottomLeftRadius: 2,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
  },
  userContent: {
    color: COLORS.onPrimary,
  },
  otherContent: {
    color: COLORS.onSurface,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontSize: 11,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  otherTime: {
    color: COLORS.outline,
  },
  readStatus: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: 'bold',
  },
});
