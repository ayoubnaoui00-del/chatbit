import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { SOCKET_URL } from '../utils/constants';
import { useAuth } from './useAuth';
import { useChatStore } from '../stores/chat.store';
import { Message, TypingPayload, PresencePayload } from '../types/message.types';
import { Conversation } from '../types/conversation.types';
import { CONVERSATIONS_QUERY_KEY } from './useConversations';

interface UseChatSocketProps {
  activeConversationId?: number | string;
  onNewMessage?: (message: Message) => void;
  onConversationUpdated?: (conversation: Conversation) => void;
}

export const useChatSocket = ({
  activeConversationId,
  onNewMessage,
  onConversationUpdated,
}: UseChatSocketProps = {}) => {
  const { token, user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  const {
    isConnected,
    setIsConnected,
    onlineUsersMap,
    setOnlineUser,
    typingUsersMap,
    setTypingUser,
    socketError,
    setSocketError,
    setActiveConversationId,
  } = useChatStore();

  const onNewMessageRef = useRef(onNewMessage);
  const onConversationUpdatedRef = useRef(onConversationUpdated);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    onConversationUpdatedRef.current = onConversationUpdated;
  }, [onConversationUpdated]);

  useEffect(() => {
    if (activeConversationId) {
      setActiveConversationId(String(activeConversationId));
    }
  }, [activeConversationId, setActiveConversationId]);

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      setSocketError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setSocketError(err.message || 'Connection failed');
      setIsConnected(false);
    });

    // Listen for incoming messages
    socket.on('message:new', (message: Message) => {
      if (onNewMessageRef.current) {
        onNewMessageRef.current(message);
      }
    });

    // Listen for typing updates
    socket.on('typing:update', (payload: TypingPayload) => {
      if (String(payload.userId) !== String(user?.id)) {
        setTypingUser(String(payload.conversationId), payload.isTyping);
      }
    });

    // Listen for online presence updates
    socket.on('presence:update', (payload: PresencePayload) => {
      setOnlineUser(String(payload.userId), payload.isOnline);
    });

    // Listen for conversation changes (e.g. assigned, closed, created)
    socket.on('conversation:updated', (payload: any) => {
      const conv: Conversation = payload?.conversation || payload;
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      if (onConversationUpdatedRef.current && conv) {
        onConversationUpdatedRef.current(conv);
      }
    });

    // Listen for server errors
    socket.on('error', (data: { message: string }) => {
      setSocketError(data.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user?.id, setIsConnected, setSocketError, setTypingUser, setOnlineUser, queryClient]);

  // Join room when activeConversationId changes
  useEffect(() => {
    if (socketRef.current && isConnected && activeConversationId) {
      socketRef.current.emit('conversation:join', { conversationId: activeConversationId });

      return () => {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit('conversation:leave', { conversationId: activeConversationId });
        }
      };
    }
  }, [activeConversationId, isConnected]);

  const sendMessage = useCallback((conversationId: number | string, content: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('message:send', { conversationId, content });
    } else {
      console.warn('Cannot send message, socket is disconnected');
    }
  }, []);

  const startTyping = useCallback((conversationId: number | string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing:start', { conversationId });
    }
  }, []);

  const stopTyping = useCallback((conversationId: number | string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing:stop', { conversationId });
    }
  }, []);

  return {
    isConnected,
    socketError,
    sendMessage,
    startTyping,
    stopTyping,
    isTyping: activeConversationId ? !!typingUsersMap[String(activeConversationId)] : false,
    onlineUsers: onlineUsersMap,
  };
};
