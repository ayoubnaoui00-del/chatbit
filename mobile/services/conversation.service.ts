import { api } from './api';
import { Conversation, CreateConversationDTO } from '../types/conversation.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const conversationService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<ApiResponse<{ conversations: Conversation[] }>>('/conversations');
    return response.data.data?.conversations || [];
  },

  async createConversation(data: CreateConversationDTO): Promise<Conversation> {
    const response = await api.post<ApiResponse<{ conversation: Conversation }>>('/conversations', data);
    return response.data.data.conversation;
  },

  async closeConversation(id: number | string): Promise<Conversation> {
    const response = await api.patch<ApiResponse<{ conversation: Conversation }>>(`/conversations/${id}/close`);
    return response.data.data.conversation;
  },
};
