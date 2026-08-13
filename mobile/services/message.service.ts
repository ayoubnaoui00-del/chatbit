import { api } from './api';
import { Message } from '../types/message.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const messageService = {
  async getMessages(conversationId: number | string, page: number = 1, limit: number = 50): Promise<Message[]> {
    const response = await api.get<ApiResponse<{ messages: Message[]; totalMessages: number; totalPages: number }>>(
      `/conversations/${conversationId}/messages`,
      {
        params: { page, limit },
      }
    );
    return response.data.data?.messages || [];
  },
};
