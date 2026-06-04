export interface User {
  id: string;
  nom: string;
  email: string;
  role: 'ETUDIANT' | 'ALUMNI' | 'ENTREPRISE' | 'ENSEIGNANT' | 'ADMIN';
  affiliation: string;
  registrationDate: string;
  status: 'Pending' | 'Approved';
  avatarInitials: string;
  avatarColor: string;
}

export interface UserApprovalStats {
  pendingCount: number;
  approvedCount: number;
  totalStudents: number;
  totalAlumni: number;
}

export interface BulkApprovalRequest {
  userIds: string[];
}

export interface ApprovalSettings {
  autoApproveEspritEmails: boolean;
  emailNotificationsOnNewRegistration: boolean;
  requireEmailVerification: boolean;
  notifyUserOnApproval: boolean;
  notifyUserOnDecline: boolean;
  autoApproveDomain: string;
}

export interface NewUserRequest {
  nom: string;
  email: string;
  role: 'ETUDIANT' | 'ALUMNI' | 'ENTREPRISE' | 'ENSEIGNANT' | 'ADMIN';
  affiliation: string;
}

export interface BulkAddUsersResponse {
  successCount: number;
  failedCount: number;
  errors?: string[];
  users?: User[];
}

export type NotificationMode = 'IMMEDIATE' | 'BATCHED' | 'HOURLY_DIGEST' | 'DAILY_DIGEST' | 'SMART';

export interface SmartMailingSettings {
  enabled: boolean;
  batchThreshold: number;
  batchWindowMinutes: number;
  notificationMode: NotificationMode;
  dailyDigestHour: number;
  prioritizeEnterprise: boolean;
  prioritizeAlumni: boolean;
  smartThresholdPerHour: number;
  dashboardNotificationsEnabled: boolean;
}
