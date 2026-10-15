import { prisma } from '../../../lib/db';

export interface AdminTicket {
  id: string;
  tenantName: string;
  plan: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAgo: string;
  messages: {
    sender: 'Tenant' | 'Admin';
    name: string;
    content: string;
    time: string;
  }[];
}

export class TicketsService {
  /**
   * Get all support tickets for admin helpdesk
   */
  static async getTickets() {
    const company = await prisma.company.findFirst();
    if (!company) {
      throw new Error('Company not found');
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        companyId: company.id,
        NOT: [
          { status: { contains: '@lid' } },
          { status: 'status@broadcast' }
        ]
      },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 10
        },
        company: {
          select: {
            name: true,
            plan: true
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    return conversations.map((conv: any) => {
      const lastMessage = conv.messages[0];
      const oldestMessage = conv.messages[conv.messages.length - 1];
      const tenantName = conv.company?.name || 'Unknown Tenant';
      const plan = conv.company?.plan || 'Basic';
      
      // Determine ticket status based on conversation
      const status = this.determineTicketStatus(conv);
      const priority = this.determineTicketPriority(conv);
      const createdAgo = this.formatTimeAgo(oldestMessage?.timestamp || conv.lastMessageAt);
      
      return {
        id: conv.id,
        tenantName,
        plan,
        subject: lastMessage?.content || 'No message',
        status,
        priority,
        createdAgo,
        messages: conv.messages.map((msg: any) => ({
          sender: msg.direction === 'outbound' ? 'Admin' : 'Tenant',
          name: msg.direction === 'outbound' ? 'Support Agent' : tenantName,
          content: msg.content,
          time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }))
      };
    });
  }

  /**
   * Get a single ticket by ID
   */
  static async getTicketById(id: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' }
        },
        company: {
          select: {
            name: true,
            plan: true
          }
        }
      }
    });

    if (!conversation) {
      throw new Error('Ticket not found');
    }

    const tenantName = conversation.company?.name || 'Unknown Tenant';
    const plan = conversation.company?.plan || 'Basic';
    const status = this.determineTicketStatus(conversation);
    const priority = this.determineTicketPriority(conversation);
    const createdAgo = this.formatTimeAgo(conversation.messages[0]?.timestamp || conversation.lastMessageAt);

    return {
      id: conversation.id,
      tenantName,
      plan,
      subject: conversation.messages[0]?.content || 'No message',
      status,
      priority,
      createdAgo,
      messages: conversation.messages.map((msg: any) => ({
        sender: msg.direction === 'outbound' ? 'Admin' : 'Tenant',
        name: msg.direction === 'outbound' ? 'Support Agent' : tenantName,
        content: msg.content,
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }))
    };
  }

  /**
   * Update ticket status
   */
  static async updateTicketStatus(id: string, status: string) {
    const conversation = await prisma.conversation.update({
      where: { id },
      data: { status }
    });

    return conversation;
  }

  /**
   * Add a message to a ticket
   */
  static async addMessageToTicket(id: string, content: string, fromMe: boolean = false) {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { messages: true }
    });

    if (!conversation) {
      throw new Error('Ticket not found');
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        content,
        direction: fromMe ? 'outbound' : 'inbound',
        timestamp: new Date()
      }
    });

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id },
      data: {
        lastMessageAt: new Date(),
        status: fromMe ? 'in_progress' : conversation.status
      }
    });

    return message;
  }

  /**
   * Determine ticket status based on conversation
   */
  private static determineTicketStatus(conversation: any): 'Open' | 'In Progress' | 'Resolved' {
    const status = conversation.status?.toLowerCase() || '';
    
    if (status.includes('resolved') || status.includes('closed')) {
      return 'Resolved';
    } else if (status.includes('in_progress') || status.includes('active')) {
      return 'In Progress';
    } else {
      return 'Open';
    }
  }

  /**
   * Determine ticket priority based on conversation
   */
  private static determineTicketPriority(conversation: any): 'Low' | 'Medium' | 'High' | 'Critical' {
    const lastMessage = conversation.messages[0];
    if (!lastMessage) return 'Medium';

    const content = (lastMessage.content || '').toLowerCase();
    
    if (content.includes('urgent') || content.includes('critical') || content.includes('emergency')) {
      return 'Critical';
    } else if (content.includes('important') || content.includes('asap') || content.includes('priority')) {
      return 'High';
    } else if (content.includes('please') || content.includes('help') || content.includes('issue')) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  /**
   * Format time ago
   */
  private static formatTimeAgo(date?: Date | string | null): string {
    if (!date) return 'Recently';
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60));
    
    if (isNaN(diffInMinutes) || diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  }
}