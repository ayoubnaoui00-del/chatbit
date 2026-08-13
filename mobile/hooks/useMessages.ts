import { useQuery, useQueryClient } from '@tanstack/react-query';
import { messageService } from '../services/message.service';
import { Message } from '../types/message.types';

export const getMessagesQueryKey = (conversationId: number | string) => ['messages', String(conversationId)];

export const useMessages = (conversationId?: number | string) => {
  const queryClient = useQueryClient();
  const queryKey = getMessagesQueryKey(conversationId || '');

  const messagesQuery = useQuery({
    queryKey,
    queryFn: () => messageService.getMessages(conversationId!),
    enabled: !!conversationId,
  });

  const appendMessage = (newMessage: Message) => {
    queryClient.setQueryData<Message[]>(queryKey, (oldMessages = []) => {
      const exists = oldMessages.some((msg) => String(msg.id) === String(newMessage.id));
      if (exists) return oldMessages;
      return [...oldMessages, newMessage];
    });
  };

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
    refetch: messagesQuery.refetch,
    appendMessage,
  };
};
