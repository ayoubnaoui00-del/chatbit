import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { useMessages } from '../../../hooks/useMessages';
import { useConversations } from '../../../hooks/useConversations';
import { useChatSocket } from '../../../hooks/useChatSocket';
import { MessageBubble } from '../../../components/MessageBubble';
import { MessageInput } from '../../../components/MessageInput';
import { TypingIndicator } from '../../../components/TypingIndicator';
import { OnlineIndicator } from '../../../components/OnlineIndicator';
import { COLORS, RADIUS, SPACING } from '../../../utils/constants';
import { Conversation } from '../../../types/conversation.types';

export default function ConversationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useAuth();
  
  const conversationId = id ? String(id) : '';

  const { conversations, closeConversation, isClosing, refetch: refetchConversations } = useConversations();
  const { messages, isLoading: isMessagesLoading, appendMessage } = useMessages(conversationId);

  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  // Sync conversation object
  useEffect(() => {
    const found = conversations.find((c) => String(c.id) === conversationId);
    if (found) {
      setCurrentConversation(found);
    }
  }, [conversations, conversationId]);

  // Socket.IO hook setup
  const {
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    isTyping,
    onlineUsers,
    socketError,
  } = useChatSocket({
    activeConversationId: conversationId,
    onNewMessage: (newMsg) => {
      appendMessage(newMsg);
    },
    onConversationUpdated: (updatedConv) => {
      if (String(updatedConv.id) === conversationId) {
        setCurrentConversation(updatedConv);
        refetchConversations();
      }
    },
  });

  const isClosed = currentConversation?.status === 'fermee';
  const isAgent = user?.role === 'agent';

  // Handle Close Ticket by Agent
  const handleCloseTicket = async () => {
    Alert.alert(
      'Clôturer la conversation',
      'Voulez-vous vraiment clôturer ce ticket ? Le client ne pourra plus envoyer de messages.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Clôturer',
          style: 'destructive',
          onPress: async () => {
            try {
              const closed = await closeConversation(conversationId);
              setCurrentConversation(closed);
              Alert.alert('Ticket clôturé', 'La conversation a été fermée avec succès.');
            } catch (err: any) {
              Alert.alert('Erreur', err.response?.data?.message || 'Impossible de fermer la conversation.');
            }
          },
        },
      ]
    );
  };

  // Configure navigation header
  useLayoutEffect(() => {
    const titleText = currentConversation?.subject || 'Chat Support';

    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitleText} numberOfLines={1}>
            {titleText}
          </Text>
          <View style={styles.headerSubtitleRow}>
            <OnlineIndicator isOnline={isConnected} size={8} />
            <Text style={styles.headerSubtitleText}>
              {isClosed
                ? 'Fermée'
                : isConnected
                ? 'En ligne (Socket.IO)'
                : 'Connexion...'}
            </Text>
          </View>
        </View>
      ),
      headerRight: () =>
        isAgent && !isClosed ? (
          <TouchableOpacity
            style={styles.closeHeaderBtn}
            onPress={handleCloseTicket}
            disabled={isClosing}
          >
            <Text style={styles.closeHeaderBtnText}>Clôturer</Text>
          </TouchableOpacity>
        ) : null,
    });
  }, [navigation, currentConversation, isConnected, isClosed, isAgent, isClosing]);

  const handleSend = (text: string) => {
    if (isClosed) return;
    sendMessage(conversationId, text);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Closed Banner */}
      {isClosed && (
        <View style={styles.closedBanner}>
          <Text style={styles.closedBannerText}>
            {"🔒 Cette conversation a été clôturée par l'agent."}
          </Text>
        </View>
      )}

      {/* Connection Warning */}
      {!!socketError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {socketError}</Text>
        </View>
      )}

      {/* Messages Stream */}
      {isMessagesLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={({ item }: any) => (
            <MessageBubble
              message={item}
              isCurrentUser={String(item.senderid) === String(user?.id)}
            />
          )}
          contentContainerStyle={styles.messagesList}
        /> as any
      )}

      {/* Typing Indicator */}
      {isTyping && !isClosed && (
        <TypingIndicator userName={isAgent ? 'Client' : 'Agent Support'} />
      )}

      {/* Input Composer */}
      <MessageInput
        onSendMessage={handleSend}
        onTypingStart={() => startTyping(conversationId)}
        onTypingStop={() => stopTyping(conversationId)}
        disabled={isClosed}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerTitleContainer: {
    alignItems: 'flex-start',
  },
  headerTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
    maxWidth: 200,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerSubtitleText: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginLeft: 10,
  },
  closeHeaderBtn: {
    backgroundColor: COLORS.errorContainer,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginRight: SPACING.xs,
  },
  closeHeaderBtnText: {
    color: COLORS.onErrorContainer,
    fontSize: 12,
    fontWeight: '600',
  },
  closedBanner: {
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.gutter,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closedBannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
  },
  errorBanner: {
    backgroundColor: COLORS.errorContainer,
    paddingVertical: 6,
    paddingHorizontal: SPACING.gutter,
    alignItems: 'center',
  },
  errorBannerText: {
    fontSize: 12,
    color: COLORS.onErrorContainer,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingVertical: SPACING.md,
  },
});
