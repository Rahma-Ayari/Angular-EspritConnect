import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ModerationReport,
  ModerationReportRequest,
  ModerationReviewRequest,
  ModerationStatus
} from '../models/moderation.model';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class ModerationService {
  private readonly frontUrl = `${environment.frontApi}/moderation`;
  private readonly backUrl = `${environment.backApi}/moderation`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  submitReport(request: ModerationReportRequest): Observable<ModerationReport> {
    const reporterId = this.authService.getCurrentUser()?.userId ?? '';
    const params = new HttpParams().set('reporterId', reporterId);
    return this.http.post<ModerationReport>(`${this.frontUrl}/reports`, request, { params });
  }

  getAllReports(): Observable<ModerationReport[]> {
    return this.http.get<ModerationReport[]>(`${this.backUrl}/reports`);
  }

  getByStatus(status: ModerationStatus): Observable<ModerationReport[]> {
    return this.http.get<ModerationReport[]>(`${this.backUrl}/reports/status/${status}`);
  }

  getReport(id: number): Observable<ModerationReport> {
    return this.http.get<ModerationReport>(`${this.backUrl}/reports/${id}`);
  }

  reviewReport(id: number, review: ModerationReviewRequest): Observable<ModerationReport> {
    return this.http.patch<ModerationReport>(`${this.backUrl}/reports/${id}/review`, review);
  }
}
