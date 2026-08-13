import { create } from 'zustand';

interface ChatState {
  activeConversationId: string | null;
  isConnected: boolean;
  onlineUsersMap: Record<string, boolean>;
  typingUsersMap: Record<string, boolean>; // conversationId -> isTyping
  socketError: string | null;
  
  setActiveConversationId: (id: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setOnlineUser: (userId: string, isOnline: boolean) => void;
  setTypingUser: (conversationId: string, isTyping: boolean) => void;
  setSocketError: (error: string | null) => void;
  resetChatStore: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  isConnected: false,
  onlineUsersMap: {},
  typingUsersMap: {},
  socketError: null,

  setActiveConversationId: (id: string | null) => set({ activeConversationId: id }),

  setIsConnected: (connected: boolean) => set({ isConnected: connected }),

  setOnlineUser: (userId: string, isOnline: boolean) =>
    set((state) => ({
      onlineUsersMap: { ...state.onlineUsersMap, [userId]: isOnline },
    })),

  setTypingUser: (conversationId: string, isTyping: boolean) =>
    set((state) => ({
      typingUsersMap: { ...state.typingUsersMap, [conversationId]: isTyping },
    })),

  setSocketError: (error: string | null) => set({ socketError: error }),

  resetChatStore: () =>
    set({
      activeConversationId: null,
      isConnected: false,
      onlineUsersMap: {},
      typingUsersMap: {},
      socketError: null,
    }),
}));
