import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useConversations } from '../../hooks/useConversations';
import { useMessages } from '../../hooks/useMessages';
import { useChatSocket } from '../../hooks/useChatSocket';
import { useChatStore } from '../../stores/chat.store';
import { ConversationItem } from '../../components/ConversationItem';
import { MessageBubble } from '../../components/MessageBubble';
import { MessageInput } from '../../components/MessageInput';
import { TypingIndicator } from '../../components/TypingIndicator';
import { OnlineIndicator } from '../../components/OnlineIndicator';
import { COLORS, RADIUS, SPACING } from '../../utils/constants';

export default function DesktopChatView() {
  const { user, logout } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<number | string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_progress' | 'closed'>('all');

  // Conversations Data
  const { conversations, isLoading: isConversationsLoading, refetch: refetchConversations } = useConversations();

  // Active Selected Conversation Data
  const selectedConversation = conversations.find(
    (c) => String(c.id) === String(selectedConversationId)
  );

  // Messages Data
  const {
    messages,
    isLoading: isMessagesLoading,
    appendMessage,
  } = useMessages(selectedConversationId ? String(selectedConversationId) : undefined);

  // Socket Integration
  const { startTyping, stopTyping, sendMessage: sendSocketMessage } = useChatSocket({
    activeConversationId: selectedConversationId ? String(selectedConversationId) : undefined,
    onNewMessage: (newMsg) => {
      appendMessage(newMsg);
    },
    onConversationUpdated: (updatedConv) => {
      refetchConversations();
    },
  });

  const typingUsersMap = useChatStore((state) => state.typingUsersMap);
  const onlineUsersMap = useChatStore((state) => state.onlineUsersMap);

  // Other User Details in active chat
  const otherUserId = selectedConversation
    ? String(selectedConversation.clientid) === String(user?.id)
      ? selectedConversation.agentid
      : selectedConversation.clientid
    : null;

  const isOtherUserOnline = otherUserId ? onlineUsersMap[String(otherUserId)] : false;
  const isOtherUserTyping = selectedConversationId
    ? typingUsersMap[String(selectedConversationId)]
    : false;

  // Filtered Conversations
  const filteredConversations = conversations.filter((c) => {
    const clientName = c.client?.fullname || c.client_name || '';
    const matchesSearch =
      (c.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab !== 'all') {
      return matchesSearch && c.status === activeTab;
    }
    return matchesSearch;
  });

  const handleSendMessage = (text: string) => {
    if (!selectedConversationId) return;
    sendSocketMessage(selectedConversationId, text);
    stopTyping(selectedConversationId);
  };

  const userName = user?.fullname || 'User';

  return (
    <View style={styles.container}>
      {/* Sidebar: Conversation List */}
      <View style={styles.sidebar}>
        {/* User Header */}
        <View style={styles.sidebarHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userRole}>
              {user?.role === 'agent' ? '🛠️ Support Agent' : '👤 Customer'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor={COLORS.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          {(['all', 'pending', 'in_progress', 'closed'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'all' ? 'All' : tab === 'pending' ? 'Pending' : tab === 'in_progress' ? 'In Progress' : 'Closed'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {isConversationsLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item: any) => String(item.id)}
            renderItem={({ item }: any) => (
              <View style={String(item.id) === String(selectedConversationId) ? styles.selectedItem : undefined}>
                <ConversationItem
                  conversation={item}
                  currentUserId={user?.id}
                  onPress={() => setSelectedConversationId(item.id)}
                />
              </View>
            )}
            contentContainerStyle={styles.listContent}
          /> as any
        )}
      </View>

      {/* Main Area: Active Chat Window */}
      <View style={styles.mainArea}>
        {selectedConversation ? (
          <View style={styles.chatWindow}>
            {/* Header */}
            <View style={styles.chatHeader}>
              <View style={styles.headerTitleArea}>
                <Text style={styles.chatTitle}>{selectedConversation.subject}</Text>
                <View style={styles.statusRow}>
                  <OnlineIndicator isOnline={isOtherUserOnline} size={10} />
                  <Text style={styles.statusText}>
                    {isOtherUserOnline ? 'Online' : 'Offline'}
                  </Text>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.statusText}>
                    Status: <Text style={styles.boldText}>{selectedConversation.status}</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Messages */}
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
                contentContainerStyle={styles.messagesContainer}
              /> as any
            )}

            {/* Typing Indicator */}
            {isOtherUserTyping && (
              <TypingIndicator
                userName={selectedConversation.client?.fullname || selectedConversation.client_name || 'Customer'}
              />
            )}

            {/* Input Box */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onTypingStart={() => selectedConversationId && startTyping(selectedConversationId)}
              onTypingStop={() => selectedConversationId && stopTyping(selectedConversationId)}
              disabled={selectedConversation.status === 'closed'}
            />
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>💬</Text>
            <Text style={styles.placeholderTitle}>Welcome to ChatBit Support</Text>
            <Text style={styles.placeholderSub}>
              Select a conversation from the left sidebar to start real-time messaging.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    height: '100%',
  },
  sidebar: {
    width: 340,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    backgroundColor: COLORS.surface,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  userRole: {
    fontSize: 12,
    color: COLORS.outline,
  },
  logoutBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceContainer,
  },
  logoutText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  searchContainer: {
    padding: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.outline,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: SPACING.lg,
  },
  selectedItem: {
    backgroundColor: 'rgba(0, 74, 198, 0.08)',
  },
  mainArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  chatWindow: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  headerTitleArea: {
    gap: 4,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    color: COLORS.outline,
  },
  bullet: {
    color: COLORS.outline,
  },
  boldText: {
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  messagesContainer: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  placeholderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginBottom: SPACING.xs,
  },
  placeholderSub: {
    fontSize: 15,
    color: COLORS.outline,
    textAlign: 'center',
    maxWidth: 400,
  },
});
