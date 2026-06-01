export interface AnalyticsDashboard {
  totalUsers: number;
  usersByRole: Record<string, number>;
  openTickets: number;
  totalTickets: number;
  ticketsByStatus: Record<string, number>;
  ticketsByPriority: Record<string, number>;
  ticketsByCategory: Record<string, number>;
  pendingModerationReports: number;
  totalFaqs: number;
  totalJobOffers: number;
  totalApplications: number;
  totalMentoringSessions: number;
  ticketsResolvedLast7Days: number;
  avgTicketResolutionHours?: number;
  chatbotAiEnabled: boolean;
  totalMatchings: number;
}

export interface SubmoduleStatus {
  name: string;
  office?: string;
  status: string;
  apiBasePath: string;
  description: string;
}

export interface IntelligenceModuleOverview {
  moduleName: string;
  submodules: SubmoduleStatus[];
}

export interface PlatformMonitoring {
  status: string;
  checkedAt: string;
  databaseUp: boolean;
  heapUsedMb: number;
  heapMaxMb: number;
  heapUsagePercent: number;
  activeTickets: number;
  pendingModerationReports: number;
  chatbotConfigured: boolean;
  applicationName: string;
}
