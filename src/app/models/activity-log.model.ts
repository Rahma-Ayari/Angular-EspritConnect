export interface ActivityLog {
  id?: number;
  userId: string;
  username: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  ipAddress: string;
  browser: string;
  createdAt: string;
}

export interface ActivityLogPage {
  content: ActivityLog[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
