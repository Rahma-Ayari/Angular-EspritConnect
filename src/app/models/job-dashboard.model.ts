export type VerificationStatus =
  | 'DOCUMENTS_REQUIRED'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED';

export type OffreType = 'STAGE' | 'EMPLOI' | 'APPRENTISSAGE' | 'PORTFOLIO' | 'CV';

export interface EntrepriseDocument {
  id: number;
  documentType: string;
  fileName: string;
  fileUrl?: string;
  uploadedAt?: string;
}

export interface EntrepriseVerification {
  entrepriseId: number;
  entrepriseNom: string;
  valide?: boolean;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  documentsCount: number;
  canPostOffers: boolean;
  documents: EntrepriseDocument[];
}

export interface EntrepriseJobDashboardOverview {
  verification: EntrepriseVerification;
  activeOffers: number;
  totalApplications: number;
  pendingApplications: number;
}

export interface OffreAiSuggestion {
  suggestedDescription: string;
  suggestedSkills: string[];
  aiDisclaimer: string;
}

export interface CandidateMatch {
  candidatureId: number;
  etudiantId: number;
  etudiantNom: string;
  etudiantEmail: string;
  filiere?: string;
  niveau?: string;
  scoreCompatibilite: number;
  skillsMatched: string[];
  recommandations: string[];
  lettreMotivationExcerpt: string;
  hasResume: boolean;
  candidatureStatus: string;
}
