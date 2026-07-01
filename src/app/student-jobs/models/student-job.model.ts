import { ContractType, ExperienceLevel, JobOffer, WorkMode } from '../../jobs/models/job.model';

export interface StudentJobFilter {
  search?: string;
  location?: string;
  domain?: string;
  workMode?: WorkMode[];
  contractType?: ContractType[];
  experienceLevel?: ExperienceLevel[];
  skills?: string[];
  salaryMin?: number;
  company?: string;
  sortBy?: 'recent' | 'title' | 'deadline' | 'match';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface StudentProfile {
  role: 'ETUDIANT' | 'ALUMNI';
  etudiantId?: number;
  alumniId?: number;
  nom: string;
  email: string;
  filiere?: string;
  domaine?: string;
  skills: string[];
  experienceLevel: ExperienceLevel;
}

export interface MatchBreakdown {
  overall: number;
  skills: number;
  experience: number;
  education: number;
  label: string;
}

export type ApplicationUiStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'INTERVIEW'
  | 'TECHNICAL_TEST'
  | 'ACCEPTED'
  | 'REJECTED';

export interface KanbanCard {
  id: string;
  offreId: number;
  jobTitle: string;
  companyName: string;
  dateLabel?: string;
  uiStatus: ApplicationUiStatus;
  isSavedOnly?: boolean;
}

export interface JobApplication {
  id: number;
  offreId: number;
  jobTitle?: string;
  companyName?: string;
  dateCandidature?: string;
  lettreMotivation?: string;
  backendStatus: string;
  uiStatus: ApplicationUiStatus;
  scoreMatch?: number;
}

export interface RecommendedJob extends JobOffer {
  matchScore: number;
  reason: string;
}

export interface SavedJobEntry {
  jobId: number;
  savedAt: string;
}

export interface CvReviewResult {
  skills: string[];
  experience: string[];
  projects: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface CoverLetterResult {
  letter: string;
}

export interface InterviewPrepResult {
  hrQuestions: string[];
  technicalQuestions: string[];
  roleQuestions: string[];
}

export interface CareerRecommendationResult {
  skills: string[];
  certifications: string[];
  projects: string[];
  learningPaths: string[];
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationUiStatus, string> = {
  SAVED: 'Saved',
  APPLIED: 'Applied',
  UNDER_REVIEW: 'Under Review',
  INTERVIEW: 'Interview',
  TECHNICAL_TEST: 'Technical Test',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected'
};

export const KANBAN_COLUMNS: ApplicationUiStatus[] = [
  'SAVED',
  'APPLIED',
  'UNDER_REVIEW',
  'INTERVIEW',
  'ACCEPTED',
  'REJECTED'
];

export function mapApplicationUiStatus(backend: string, _appliedAt?: string): ApplicationUiStatus {
  if (backend === 'ACCEPTEE') return 'ACCEPTED';
  if (backend === 'REFUSEE') return 'REJECTED';
  if (backend === 'EN_ENTRETIEN') return 'INTERVIEW';
  if (backend === 'EN_ATTENTE') return 'APPLIED';
  return 'APPLIED';
}
