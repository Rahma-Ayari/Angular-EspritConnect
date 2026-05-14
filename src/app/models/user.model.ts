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
