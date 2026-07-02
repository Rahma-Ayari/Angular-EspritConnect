export interface UserActivitySummary {
  username: string;
  lastLogin: string;
  lastProfileUpdate: string;
  riskLevel: string;
  timeline: string[];
}

export interface AIAnalysisResponse {
  overallSummary: string;
  userSummaries: UserActivitySummary[];
  recommendations: string[];
}
