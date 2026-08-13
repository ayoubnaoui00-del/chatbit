import { api } from './api';
import { Conversation, CreateConversationDTO } from '../types/conversation.types';

export const conversationService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get<Conversation[]>('/conversations');
    return response.data;
  },

  async createConversation(data: CreateConversationDTO): Promise<Conversation> {
    const response = await api.post<Conversation>('/conversations', data);
    return response.data;
  },

  async closeConversation(id: number | string): Promise<Conversation> {
    const response = await api.patch<Conversation>(`/conversations/${id}/close`);
    return response.data;
  },
};
