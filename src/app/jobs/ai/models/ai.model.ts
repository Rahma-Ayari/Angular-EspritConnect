import {
  AIGenerateRequest,
  AIGenerateResponse,
  AIImproveRequest,
  ContractType,
  ExperienceLevel
} from '../../models/job.model';

export interface AiMeta {
  provider?: string;
  cached?: boolean;
  aiDisclaimer?: string;
}

export interface AiJobGenerateWrapper extends AiMeta {
  data: AIGenerateResponse;
}

export interface AiImportExtractRequest {
  rawContent: string;
  source: 'URL' | 'PDF' | 'TEXT';
  forceRefresh?: boolean;
}

export interface AiImportExtractResponse extends AiMeta {
  title: string;
  contractType?: ContractType | string;
  experienceLevel?: ExperienceLevel | string;
  location?: string;
  skills: string[];
  responsibilities?: string;
  requirements?: string;
  benefits?: string;
  description?: string;
}

export interface AiMatchCandidateRequest {
  offreId: number;
  etudiantId?: number;
  candidatureId?: number;
  forceRefresh?: boolean;
}

export interface AiMatchCandidateResponse extends AiMeta {
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  etudiantId?: number;
  offreId?: number;
  etudiantNom?: string;
}

export interface AiCandidateSummaryRequest {
  offreId: number;
  etudiantId?: number;
  candidatureId?: number;
  matchData?: AiMatchCandidateResponse;
  forceRefresh?: boolean;
}

export interface AiCandidateSummaryResponse extends AiMeta {
  summary: string;
  overallScore: number;
  recommendation: string;
}

export interface AiRecruitmentInsightsRequest {
  entrepriseId?: number;
  offreId?: number;
  totalOffers: number;
  activeOffers: number;
  totalApplications: number;
  avgApplicationsPerOffer: number;
  applicationsByStatus?: Record<string, number>;
  topCandidateScores?: number[];
  commonMissingSkills?: string[];
  forceRefresh?: boolean;
}

export interface AiRecruitmentInsightsResponse extends AiMeta {
  insights: string[];
  summary: string;
  recommendations: string[];
}

export type AiGenerateRequest = AIGenerateRequest;
export type AiImproveRequest = AIImproveRequest;
export type AiGenerateResponse = AIGenerateResponse;

export interface TopMatchCandidate {
  candidatureId: number;
  etudiantId: number;
  etudiantNom: string;
  etudiantEmail: string;
  filiere?: string;
  scoreCompatibilite: number;
  skillsScore?: number;
  experienceScore?: number;
  educationScore?: number;
  aiScore?: number;
  skillsMatched: string[];
  recommendation?: string;
  hasResume: boolean;
  candidatureStatus: string;
}
