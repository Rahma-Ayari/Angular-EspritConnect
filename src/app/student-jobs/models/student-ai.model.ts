/** AI response metadata from backend */
export interface AiResponseMeta {
  provider?: string;
  cached?: boolean;
  aiDisclaimer?: string;
}

export interface StudentJobMatchResult extends AiResponseMeta {
  overallScore: number;
  skillsScore: number;
  projectsScore: number;
  experienceScore: number;
  educationScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  improvementSuggestions: string[];
  recommendation: string;
  offreId?: number;
  jobTitle?: string;
}

export interface StudentResumeReviewResult extends AiResponseMeta {
  atsScore: number;
  atsLabel: string;
  strengths: string[];
  weaknesses: string[];
  formattingIssues: string[];
  keywordGaps: string[];
  suggestions: string[];
  extractedSkills: string[];
  extractedExperience: string[];
  extractedEducation: string[];
}

export interface StudentResumeOptimizerResult extends AiResponseMeta {
  atsScore: number;
  atsLabel: string;
  optimizedSummary: string;
  improvedBulletPoints: string[];
  atsKeywords: string[];
  missingSkills: string[];
  suggestions: string[];
  offreId?: number;
  jobTitle?: string;
}

export interface StudentCoverLetterResult extends AiResponseMeta {
  letter: string;
}

export interface StudentInterviewPrepResult extends AiResponseMeta {
  technicalQuestions: string[];
  behavioralQuestions: string[];
  hrQuestions: string[];
  suggestedAnswers: string[];
  interviewTips: string[];
}

export interface StudentApplicationOptimizerResult extends AiResponseMeta {
  matchScore: number;
  matchLabel: string;
  skillsScore: number;
  readinessScore: number;
  missingSkills: string[];
  optimizedSummary: string;
  improvedBulletPoints: string[];
  coverLetter: string;
  atsKeywords: string[];
  readinessChecklist: string[];
  recommendation: string;
  offreId?: number;
  jobTitle?: string;
}

export interface StudentCareerAdviceResult extends AiResponseMeta {
  answer: string;
  actionItems: string[];
  resources: string[];
}

export interface ResumeSection {
  id: string;
  type: 'summary' | 'education' | 'experience' | 'projects' | 'skills' | 'languages' | 'certificates';
  title: string;
  content: string;
  order: number;
}

export interface ResumeData {
  templateId: string;
  fullName: string;
  email: string;
  phone: string;
  sections: ResumeSection[];
  lastUpdated?: string;
}

export const RESUME_TEMPLATES = [
  { id: 'classic', name: 'Classic ATS', description: 'Clean single-column layout' },
  { id: 'modern', name: 'Modern Pro', description: 'Bold headers with skill bars' },
  { id: 'minimal', name: 'Minimal', description: 'Ultra-clean for tech roles' },
  { id: 'academic', name: 'Academic', description: 'Education-first for students' }
] as const;

export const COVER_LETTER_TEMPLATES = [
  { id: 'professional', name: 'Professional', color: '#666' },
  { id: 'creative', name: 'Creative', color: '#cc0000' },
  { id: 'startup', name: 'Startup', color: '#7c3aed' }
] as const;

export function matchLabelFromScore(score: number): string {
  if (score >= 85) return 'Excellent Match';
  if (score >= 70) return 'Good Match';
  if (score >= 50) return 'Fair Match';
  return 'Low Match';
}

export function providerBadge(provider?: string): string {
  if (!provider) return 'Powered by AI';
  if (provider.toLowerCase().includes('gemini')) return 'Powered by Gemini AI';
  if (provider.toLowerCase().includes('openai')) return 'Powered by OpenAI';
  return `Powered by ${provider}`;
}
