import { User } from './auth.types';

export interface Message {
  id: number | string;
  conversationid: number | string;
  senderid: number | string;
  content: string;
  isread: boolean;
  sentat: string;
  sender_name?: string;
  sender_role?: string;
  sender?: User;
}

export interface SendMessageDTO {
  conversationId: number | string;
  content: string;
}

export interface TypingPayload {
  conversationId: number | string;
  userId: number | string;
  fullname?: string;
  isTyping: boolean;
}

export interface PresencePayload {
  userId: number | string;
  fullname?: string;
  role?: string;
  isOnline: boolean;
}
