import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UserEvent, UserEventFilters } from '../models/user-event.model';

@Injectable({
  providedIn: 'root'
})
export class UserEventsService {
  private readonly apiUrl = 'http://localhost:8087/espritconnect/api/evenements';

  constructor(private http: HttpClient) {}

  getEvents(filters: UserEventFilters = {}): Observable<UserEvent[]> {
    return this.http.get<UserEvent[]>(`${this.apiUrl}/public`, { params: this.buildParams(filters) });
  }

  getEventById(id: number): Observable<UserEvent> {
    return this.http.get<UserEvent>(`${this.apiUrl}/public/${id}`);
  }

  getUpcomingEvents(): Observable<UserEvent[]> {
    return this.http.get<UserEvent[]>(`${this.apiUrl}/upcoming`);
  }

  private buildParams(filters: UserEventFilters): HttpParams {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && `${value}`.trim() !== '') {
        params = params.set(key, `${value}`.trim());
      }
    });

    return params;
  }
}
