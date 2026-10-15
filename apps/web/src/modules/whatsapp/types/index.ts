export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status?: MessageStatus;
}

export interface WhatsAppChat {
  id: string;
  contactName: string;
  phoneNumber: string;
  companyName: string;
  unreadCount: number;
  lastMessageTime: string;
  isOnline: boolean;
  messages: WhatsAppMessage[];
}
