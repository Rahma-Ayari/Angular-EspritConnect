export enum BadgeType {
  MANUALLY_ASSIGNED = 'MANUALLY_ASSIGNED',
  AUTOMATICALLY_EARNED = 'AUTOMATICALLY_EARNED'
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface Badge {
  id?: number;
  name: string;
  criteria: string;
  enabled: boolean;
  icon: string;
  badgeType: BadgeType;
  createdAt?: string;
  userCount?: number;
  postThreshold?: number;
  resolvedTicketsThreshold?: number;
}

export interface BadgeReq {
  name: string;
  criteria: string;
  icon: string;
  badgeType: BadgeType;
  enabled: boolean;
  postThreshold?: number;
  resolvedTicketsThreshold?: number;
}

export interface UserBadge {
  id?: number;
  userId: string;
  userName: string;
  badgeId: number;
  badgeName: string;
  earnedAt?: string;
}

export interface BadgeRequest {
  id?: number;
  userId: string;
  userName: string;
  badgeId: number;
  badgeName: string;
  motivation: string;
  status: RequestStatus;
  requestedAt?: string;
}
