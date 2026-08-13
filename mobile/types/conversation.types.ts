import { User } from './auth.types';

export type ConversationStatus = 'pending' | 'in_progress' | 'closed';

export interface Conversation {
  id: number | string;
  subject: string;
  status: ConversationStatus;
  clientid: number | string;
  agentid: number | string | null;
  createdat: string;
  closedat?: string | null;
  client_name?: string;
  client_email?: string;
  agent_name?: string;
  agent_email?: string;
  client?: User;
  agent?: User;
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface CreateConversationDTO {
  subject: string;
}
