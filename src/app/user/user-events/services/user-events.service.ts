import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UserEvent, UserEventFilters, UserParticipation } from '../models/user-event.model';
import { Event } from '../../../admin/events/models/event.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserEventsService {
  private readonly apiUrl = `${environment.apiUrl}/evenements`;
  private readonly typesUrl = `${environment.apiUrl}/evenement-types/active`;

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

  participate(eventId: number): Observable<UserParticipation> {
    return this.http.post<UserParticipation>(`${this.apiUrl}/${eventId}/participations`, {});
  }

  cancelParticipation(eventId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/participations`);
  }

  getMyParticipations(): Observable<UserParticipation[]> {
    return this.http.get<UserParticipation[]>(`${this.apiUrl}/participations/mine`);
  }

  getMyCreatedEvents(): Observable<UserEvent[]> {
    return this.http.get<UserEvent[]>(`${this.apiUrl}/mine`);
  }

  createEvent(event: Event): Observable<UserEvent> {
    return this.http.post<UserEvent>(this.apiUrl, event);
  }

  updateEvent(id: number, event: Event): Observable<UserEvent> {
    return this.http.put<UserEvent>(`${this.apiUrl}/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getEventTypes(): Observable<Array<{ idTypeEvenement: number; nom: string }>> {
    return this.http.get<Array<{ idTypeEvenement: number; nom: string }>>(this.typesUrl);
  }

  uploadEventImage(file: File): Observable<HttpEvent<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/images`, formData, {
      observe: 'events',
      reportProgress: true
    });
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
