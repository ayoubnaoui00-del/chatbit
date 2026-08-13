import { User } from './auth.types';

export type ConversationStatus = 'en_attente' | 'en_cours' | 'fermee';

export interface Conversation {
  id: number | string;
  subject: string;
  status: ConversationStatus;
  clientid: number | string;
  agentid: number | string | null;
  createdat: string;
  closedat?: string | null;
  client?: User;
  agent?: User;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface CreateConversationDTO {
  subject: string;
}
