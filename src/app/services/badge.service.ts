import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Badge, BadgeReq, BadgeRequest, UserBadge } from '../models/badge.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  private apiUrl = 'http://localhost:8088/espritconnect/api/badges';

  constructor(private http: HttpClient, private authService: AuthService) {}

  get CURRENT_USER_ID(): string {
    return this.authService.getCurrentUser().id;
  }

  // === BADGE CRUD ===

  getAllBadges(): Observable<Badge[]> {
    return this.http.get<Badge[]>(this.apiUrl);
  }

  getBadgeById(id: number): Observable<Badge> {
    return this.http.get<Badge>(`${this.apiUrl}/${id}`);
  }

  createBadge(badge: BadgeReq): Observable<Badge> {
    return this.http.post<Badge>(this.apiUrl, badge);
  }

  updateBadge(id: number, badge: BadgeReq): Observable<Badge> {
    return this.http.put<Badge>(`${this.apiUrl}/${id}`, badge);
  }

  deleteBadge(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleBadgeStatus(id: number): Observable<Badge> {
    return this.http.patch<Badge>(`${this.apiUrl}/${id}/toggle`, {});
  }

  toggleAllBadges(enabled: boolean): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/toggle-all?enabled=${enabled}`, {});
  }

  // === USER BADGE ASSIGNMENT ===

  assignBadgeToUser(badgeId: number, userId: string): Observable<UserBadge> {
    return this.http.post<UserBadge>(`${this.apiUrl}/${badgeId}/assign/${userId}`, {});
  }

  removeBadgeFromUser(badgeId: number, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${badgeId}/remove/${userId}`);
  }

  getUserBadges(userId: string): Observable<UserBadge[]> {
    return this.http.get<UserBadge[]>(`${this.apiUrl}/user/${userId}`);
  }

  // === BADGE REQUESTS ===

  requestBadge(badgeId: number, motivation: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request`, {
      badgeId,
      userId: this.CURRENT_USER_ID,
      motivation
    });
  }

  getAllRequests(): Observable<BadgeRequest[]> {
    return this.http.get<BadgeRequest[]>(`${this.apiUrl}/requests`);
  }

  handleRequest(requestId: number, approved: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/requests/${requestId}/handle?approved=${approved}`,
      {}
    );
  }
}
