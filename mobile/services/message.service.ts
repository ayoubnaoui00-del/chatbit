import { api } from './api';
import { Message } from '../types/message.types';

export const messageService = {
  async getMessages(conversationId: number | string, page: number = 1, limit: number = 50): Promise<Message[]> {
    const response = await api.get<Message[]>(`/conversations/${conversationId}/messages`, {
      params: { page, limit },
    });
    return response.data;
  },
};
