import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EntrepriseOption, Event, EventFilters, EventStats, EventType, EventApprovalStatus } from '../models/event.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiRoot = environment.apiUrl;
  private readonly apiUrl = `${this.apiRoot}/evenements`;
  private readonly typesUrl = `${this.apiRoot}/evenement-types`;

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

  getEventTypes(activeOnly = false): Observable<EventType[]> {
    return this.http.get<EventType[]>(activeOnly ? `${this.typesUrl}/active` : this.typesUrl);
  }

  getEventTypeById(id: number): Observable<EventType> {
    return this.http.get<EventType>(`${this.typesUrl}/${id}`);
  }

  createEventType(type: EventType): Observable<EventType> {
    return this.http.post<EventType>(this.typesUrl, type);
  }

  updateEventType(id: number, type: EventType): Observable<EventType> {
    return this.http.put<EventType>(`${this.typesUrl}/${id}`, type);
  }

  deleteEventType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.typesUrl}/${id}`);
  }

  uploadEventImage(file: File): Observable<HttpEvent<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/images`, formData, {
      observe: 'events',
      reportProgress: true
    });
  }

  getPendingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/admin/pending`);
  }

  getEventsByApprovalStatus(status: EventApprovalStatus): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/admin/approval-status/${status}`);
  }

  approveEvent(id: number): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/admin/${id}/approve`, {});
  }

  rejectEvent(id: number, reason: string): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/admin/${id}/reject`, { reason });
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
