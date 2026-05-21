export interface ForumCategory {
  id?: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt?: string;
  postCount?: number; // Calculé dynamiquement ou renseigné
}

export interface ForumPost {
  id?: number;
  title: string;
  content: string;
  category: ForumCategory;
  authorName: string;
  authorEmail: string;
  authorRole: 'ETUDIANT' | 'ALUMNI' | 'ENTREPRISE' | 'ADMIN' | 'ENSEIGNANT';
  createdAt?: string;
  pinned: boolean;
  reported: boolean;
  reportReason?: string;
  viewsCount: number;
  replies?: ForumReply[];
}

export interface ForumReply {
  id?: number;
  post?: ForumPost;
  content: string;
  authorName: string;
  authorEmail: string;
  authorRole: 'ETUDIANT' | 'ALUMNI' | 'ENTREPRISE' | 'ADMIN' | 'ENSEIGNANT';
  createdAt?: string;
  reported: boolean;
  reportReason?: string;
}

export interface ForumStats {
  totalPosts: number;
  totalReplies: number;
  totalReported: number;
  reportedPostsCount: number;
  reportedRepliesCount: number;
  totalCategories: number;
  roleDistribution: Record<string, number>;
}
