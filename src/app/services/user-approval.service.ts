import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, UserApprovalStats, BulkApprovalRequest, ApprovalSettings } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserApprovalService {
  private apiUrl = `${environment.apiUrl}/admin/users`;

  constructor(private http: HttpClient) {}

  getPendingUsers(search?: string, role?: string): Observable<User[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    if (role) {
      params = params.set('role', role);
    }
    return this.http.get<User[]>(`${this.apiUrl}/pending`, { params });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/all`);
  }

  getApprovedUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/approved`);
  }

  getStats(): Observable<UserApprovalStats> {
    return this.http.get<UserApprovalStats>(`${this.apiUrl}/stats`);
  }

  approveUser(userId: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/approve`, {});
  }

  declineUser(userId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${userId}/decline`, {});
  }

  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${userId}`);
  }

  bulkApprove(userIds: string[]): Observable<User[]> {
    const request: BulkApprovalRequest = { userIds };
    return this.http.post<User[]>(`${this.apiUrl}/bulk-approve`, request);
  }

  bulkDecline(userIds: string[]): Observable<{ message: string }> {
    const request: BulkApprovalRequest = { userIds };
    return this.http.post<{ message: string }>(`${this.apiUrl}/bulk-decline`, request);
  }

  getSettings(): Observable<ApprovalSettings> {
    return this.http.get<ApprovalSettings>(`${this.apiUrl}/settings`);
  }

  updateSettings(settings: ApprovalSettings): Observable<ApprovalSettings> {
    return this.http.put<ApprovalSettings>(`${this.apiUrl}/settings`, settings);
  }

  resetSettings(): Observable<ApprovalSettings> {
    return this.http.post<ApprovalSettings>(`${this.apiUrl}/settings/reset`, {});
  }
}
