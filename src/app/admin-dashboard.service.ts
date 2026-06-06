import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface AdminDashboardResponse {
  pendingApprovalsCount: number;
  summary: {
    totalUsers: number;
    students: number;
    alumni: number;
    companies: number;
  };
  pendingApprovals: Array<{
    profileType: string;
    companyId: number | null;
    userId: string | null;
    companyName: string;
    sector: string;
    statusLabel: string;
  }>;
  activityOverview: {
    newRegistrations: number;
    registrationDeltaPercent: number;
    activeJobPostings: number;
    jobPostingDeltaPercent: number;
    sentEmailCampaigns: number;
    emailCampaignDeltaPercent: number;
    avgOpenRatePercent: number;
  };
  quickStart: {
    completedSteps: number;
    totalSteps: number;
  };
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly API = `${environment.apiUrl}/admin/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(this.API);
  }

  getPendingApprovals(limit: number): Observable<AdminDashboardResponse['pendingApprovals']> {
    return this.http.get<AdminDashboardResponse['pendingApprovals']>(`${this.API}/approvals?limit=${limit}`);
  }

  approveCompany(companyId: number): Observable<void> {
    return this.http.post<void>(`${this.API}/approvals/${companyId}/approve`, {});
  }

  declineCompany(companyId: number): Observable<void> {
    return this.http.post<void>(`${this.API}/approvals/${companyId}/decline`, {});
  }

  approveUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.API}/approvals/user/${userId}/approve`, {});
  }

  declineUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.API}/approvals/user/${userId}/decline`, {});
  }
}
