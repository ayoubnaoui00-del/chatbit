import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../services/conversation.service';
import { CreateConversationDTO } from '../types/conversation.types';

export const CONVERSATIONS_QUERY_KEY = ['conversations'];

export const useConversations = () => {
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: () => conversationService.getConversations(),
  });

  const createConversationMutation = useMutation({
    mutationFn: (dto: CreateConversationDTO) => conversationService.createConversation(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });

  const closeConversationMutation = useMutation({
    mutationFn: (id: number | string) => conversationService.closeConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });

  return {
    conversations: conversationsQuery.data || [],
    isLoading: conversationsQuery.isLoading,
    isError: conversationsQuery.isError,
    error: conversationsQuery.error,
    refetch: conversationsQuery.refetch,
    createConversation: createConversationMutation.mutateAsync,
    isCreating: createConversationMutation.isPending,
    closeConversation: closeConversationMutation.mutateAsync,
    isClosing: closeConversationMutation.isPending,
  };
};
