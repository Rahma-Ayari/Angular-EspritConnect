import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EntrepriseOption, Event, EventFilters, EventStats } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiRoot = 'http://localhost:8087/espritconnect/api';
  private readonly apiUrl = `${this.apiRoot}/evenements`;

  constructor(private http: HttpClient) {}

  getAllEvents(filters: EventFilters = {}): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl, { params: this.buildParams(filters) });
  }

  getPublicEvents(filters: Pick<EventFilters, 'search' | 'type'> = {}): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/public`, { params: this.buildParams(filters) });
  }

  getUpcomingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/upcoming`);
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  getPublicEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/public/${id}`);
  }

  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
  }

  updateEvent(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getStats(): Observable<EventStats> {
    return this.http.get<EventStats>(`${this.apiUrl}/stats`);
  }

  getTotalEvents(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/total`);
  }

  getEntreprises(): Observable<EntrepriseOption[]> {
    return this.http.get<EntrepriseOption[]>(`${this.apiRoot}/entreprises`);
  }

  private buildParams(filters: EventFilters | Pick<EventFilters, 'search' | 'type'>): HttpParams {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && `${value}`.trim() !== '') {
        params = params.set(key, `${value}`.trim());
      }
    });

    return params;
  }
}
