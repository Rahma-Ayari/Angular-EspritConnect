export interface JobOffer {
  id?: number;
  title: string;
  contractType: ContractType;
  department: string;
  experienceLevel: ExperienceLevel;
  numberOfPositions: number;
  workMode: WorkMode;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  duration?: string;
  deadline: Date;
  requiredSkills: string[];
  technologies: string[];
  languages: string[];
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  applicationUrl?: string;
  status: JobStatus;
  applicationCount: number;
  createdAt?: Date | string;
  updatedAt?: Date;
  isPinned?: boolean;
  isArchived?: boolean;
  entrepriseId?: number;
  companyId?: number;
  companyName?: string;
}

export type ContractType = 'STAGE' | 'EMPLOI' | 'APPRENTISSAGE' | 'PFE';

export type ExperienceLevel = 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR' | 'EXPERT';

export type WorkMode = 'REMOTE' | 'HYBRID' | 'ON_SITE';

export type JobStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'CLOSED' | 'PAUSED';

export interface JobFilter {
  search?: string;
  contractType?: ContractType[];
  status?: JobStatus[];
  department?: string;
  location?: string;
  sortBy?: 'recent' | 'title' | 'applications' | 'deadline';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface JobFormData {
  step1?: {
    title: string;
    contractType: ContractType;
    department: string;
    experienceLevel: ExperienceLevel;
    numberOfPositions: number;
  };
  step2?: {
    workMode: WorkMode;
    location: string;
    salaryMin?: number;
    salaryMax?: number;
    duration?: string;
    deadline: Date;
  };
  step3?: {
    requiredSkills: string[];
    technologies: string[];
    languages: string[];
  };
  step4?: {
    description: string;
    responsibilities: string;
    requirements: string;
    benefits: string;
  };
}

export type OutputLanguage = 'en' | 'fr' | 'ar';

export interface AIGenerateRequest {
  title?: string;
  skills?: string[];
  experienceLevel?: ExperienceLevel;
  contractType?: ContractType;
  department?: string;
  location?: string;
  additionalPrompt?: string;
  outputLanguage?: OutputLanguage;
}

export interface AIGenerateResponse {
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  keywords: string[];
  recruitmentText?: string;
  aiDisclaimer?: string;
  suggestedTitle?: string;
  suggestedSkills?: string[];
  provider?: string;
  cached?: boolean;
}

export interface AIImproveRequest {
  originalText: string;
  jobTitle?: string;
  targetAudience?: string;
  outputLanguage?: OutputLanguage;
}

export const OUTPUT_LANGUAGE_LABELS: Record<OutputLanguage, string> = {
  en: 'English',
  fr: 'French',
  ar: 'Arabic'
};

export interface ImportJobRequest {
  url?: string;
  pdfFile?: File;
  rawText?: string;
  source: 'URL' | 'PDF' | 'TEXT';
}

export interface ImportJobResponse {
  title: string;
  description: string;
  responsibilities?: string;
  skills: string[];
  requirements: string;
  benefits?: string;
  location?: string;
  contractType?: ContractType;
  experienceLevel?: ExperienceLevel | string;
  extractedData: Record<string, any>;
}

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  STAGE: 'Internship',
  EMPLOI: 'Full-time',
  APPRENTISSAGE: 'Apprenticeship',
  PFE: 'Final Year Project'
};

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  JUNIOR: 'Junior (0-2 years)',
  INTERMEDIATE: 'Intermediate (2-5 years)',
  SENIOR: 'Senior (5+ years)',
  EXPERT: 'Expert (10+ years)'
};

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ON_SITE: 'On-site'
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  ACTIVE: 'Active',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
  CLOSED: 'Closed',
  PAUSED: 'Paused'
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  ACTIVE: '#059669',
  DRAFT: '#6b7280',
  ARCHIVED: '#9ca3af',
  CLOSED: '#dc2626',
  PAUSED: '#d97706'
};
