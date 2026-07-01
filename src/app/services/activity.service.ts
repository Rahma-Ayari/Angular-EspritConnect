import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivityLogPage } from '../models/activity-log.model';
import { AIAnalysisResponse } from '../models/ai-analysis-response.model';
import { UserActivityInfo } from '../models/user-activity-info.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private apiUrl = 'http://localhost:8089/espritconnect/api/activity';

  constructor(private http: HttpClient) {}

  getAllActivities(page: number = 0, size: number = 10, sortBy: string = 'createdAt', direction: string = 'desc'): Observable<ActivityLogPage> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);
      
    return this.http.get<ActivityLogPage>(this.apiUrl, { params });
  }

  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistics`);
  }

  analyzeActivities(): Observable<AIAnalysisResponse> {
    return this.http.post<AIAnalysisResponse>(`${this.apiUrl}/analyze`, {});
  }

  getUserActivityInfo(email: string): Observable<UserActivityInfo> {
    return this.http.get<UserActivityInfo>(`${this.apiUrl}/user-info/email/${encodeURIComponent(email)}`);
  }
}
