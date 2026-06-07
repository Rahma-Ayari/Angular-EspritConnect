import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AnalyticsDashboard,
  IntelligenceModuleOverview,
  PlatformMonitoring
} from '../models/intelligence.model';

@Injectable({ providedIn: 'root' })
export class IntelligenceService {
  private readonly backAnalytics = `${environment.backApi}/analytics`;
  private readonly backReports = `${environment.backApi}/reports`;
  private readonly backMonitoring = `${environment.backApi}/monitoring`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AnalyticsDashboard> {
    return this.http.get<AnalyticsDashboard>(`${this.backAnalytics}/dashboard`);
  }

  getModuleOverview(): Observable<IntelligenceModuleOverview> {
    return this.http.get<IntelligenceModuleOverview>(`${this.backAnalytics}/module-overview`);
  }

  exportTicketsCsv(from?: string, to?: string): Observable<Blob> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get(`${this.backReports}/tickets/export`, { params, responseType: 'blob' });
  }

  exportPlatformSummary(from?: string, to?: string): Observable<Blob> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get(`${this.backReports}/platform/summary`, { params, responseType: 'blob' });
  }

  getMonitoringStatus(): Observable<PlatformMonitoring> {
    return this.http.get<PlatformMonitoring>(`${this.backMonitoring}/status`);
  }
}
