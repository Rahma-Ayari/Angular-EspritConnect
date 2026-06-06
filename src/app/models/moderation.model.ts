export type ModerationContentType = 'FORUM_POST' | 'MESSAGE' | 'USER_PROFILE' | 'JOB_OFFER' | 'OTHER';
export type ModerationStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
export type ModerationAction = 'NONE' | 'WARN_USER' | 'HIDE_CONTENT' | 'SUSPEND_USER' | 'ESCALATED_TO_TICKET';

export interface ModerationReport {
  id: number;
  contentType: ModerationContentType;
  contentRefId: string;
  reason: string;
  status: ModerationStatus;
  actionTaken: ModerationAction;
  reporterId?: string;
  reporterName?: string;
  moderatorId?: string;
  moderatorName?: string;
  moderatorNotes?: string;
  linkedTicketId?: number;
  createdAt?: string;
  resolvedAt?: string;
}

export interface ModerationReportRequest {
  contentType: ModerationContentType;
  contentRefId: string;
  reason: string;
}

export interface ModerationReviewRequest {
  status: ModerationStatus;
  actionTaken: ModerationAction;
  moderatorNotes?: string;
  linkedTicketId?: number;
}
