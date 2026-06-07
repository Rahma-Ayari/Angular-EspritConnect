export type AuthorRole = 'ETUDIANT' | 'ALUMNI' | 'ENSEIGNANT' | 'ADMIN';

export interface ForumCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt?: string;
}

export interface ForumReply {
  id?: number;
  content: string;
  authorName: string;
  authorEmail: string;
  authorRole: AuthorRole;
  createdAt?: string;
  reported?: boolean;
  reportReason?: string;
}

export interface ForumPost {
  id: number;
  title: string;
  content: string;
  category: ForumCategory;
  authorName: string;
  authorEmail: string;
  authorRole: AuthorRole;
  createdAt: string;
  pinned?: boolean;
  reported?: boolean;
  reportReason?: string;
  viewsCount?: number;
  likesCount?: number;
  replies?: ForumReply[];
  forumGroup?: ForumGroup;
}

export type GroupStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';
export type GroupRole = 'OWNER' | 'MODERATOR' | 'MEMBER';
export type MemberStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ForumGroup {
  id?: number;
  name: string;
  description?: string;
  creatorEmail: string;
  creatorName: string;
  private: boolean; // mapped to isPrivate on Spring Boot
  status?: GroupStatus;
  createdAt?: string;
}

export interface ForumGroupMember {
  id?: number;
  group: ForumGroup;
  userEmail: string;
  userName: string;
  role: GroupRole;
  status: MemberStatus;
  joinedAt?: string;
}

