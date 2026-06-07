export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface TicketCategory {
  id: number;
  name: string;
  description: string;
  slaHours: number;
}

export interface SupportTicket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  attachmentUrl?: string;
  tags?: string[];
  categoryId: number;
  categoryName: string;
  creatorId: string;
  creatorName: string;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaMessage?: string;
  timeline?: TicketHistoryDTO[];
}

export interface TicketHistoryDTO {
  id: number;
  eventType: string;
  description: string;
  timestamp: string;
  performedBy: string;
}

export interface TicketMessage {
  id: number;
  content: string;
  createdAt: string;
  isInternal: boolean;
  senderId: string;
  senderName: string;
  attachmentUrl?: string;
}

export interface SupportTicketRequest {
  title: string;
  description: string;
  categoryId: number;
  priority: TicketPriority;
  attachmentUrl?: string;
  tags?: string[];
}

export interface TicketMessageRequest {
  content: string;
  isInternal: boolean;
  attachmentUrl?: string;
}
