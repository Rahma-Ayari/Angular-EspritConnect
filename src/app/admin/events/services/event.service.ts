import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ArchiveEvent,
  CategorySuggestion,
  EntrepriseOption,
  Event,
  EventFilters,
  EventMatch,
  EventParticipation,
  EventStats,
  EventSuggestions,
  EventType,
  PageResponse,
  WaitingListEntry
} from '../models/event.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly apiRoot = environment.apiUrl;
  private readonly apiUrl = `${this.apiRoot}/evenements`;

  constructor(private http: HttpClient) {}

  getAllEvents(filters: EventFilters = {}): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl, { params: this.buildParams(filters) });
  }

  getAllEventsPaged(filters: EventFilters = {}, page = 0, size = 7): Observable<PageResponse<Event>> {
    const params = this.buildParams({ ...filters, page: page.toString(), size: size.toString() });
    return this.http.get<PageResponse<Event>>(`${this.apiUrl}/paged`, { params });
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

  getEventParticipations(id: number): Observable<EventParticipation[]> {
    return this.http.get<EventParticipation[]>(`${this.apiUrl}/${id}/participations`);
  }

  getWaitingList(eventId: number): Observable<WaitingListEntry[]> {
    return this.http.get<WaitingListEntry[]>(`${this.apiUrl}/${eventId}/waiting-list`);
  }

  joinWaitingList(eventId: number): Observable<WaitingListEntry> {
    return this.http.post<WaitingListEntry>(`${this.apiUrl}/${eventId}/waiting-list`, {});
  }

  removeFromWaitingList(waitingListId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/waiting-list/${waitingListId}`);
  }

  acceptWaitingListUser(waitingListId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/waiting-list/${waitingListId}/accept`, {});
  }

  rejectWaitingListUser(waitingListId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/waiting-list/${waitingListId}/reject`, {});
  }

  approveParticipation(participationId: number): Observable<EventParticipation> {
    return this.http.post<EventParticipation>(`${this.apiUrl}/participations/${participationId}/approve`, {});
  }

  rejectParticipation(participationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/participations/${participationId}/reject`);
  }

  getArchivedEvents(): Observable<ArchiveEvent[]> {
    return this.http.get<ArchiveEvent[]>(`${this.apiUrl}/archive`);
  }

  getSuggestions(): Observable<EventSuggestions> {
    return this.http.get<EventSuggestions>(`${this.apiUrl}/suggestions`);
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

  deleteEventWithEmail(id: number, emailRequest: { subject: string; content: string }): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/with-email`, { body: emailRequest });
  }

  getStats(): Observable<EventStats> {
    return this.http.get<EventStats>(`${this.apiUrl}/stats`);
  }

  getTotalEvents(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/total`);
  }

  getEntreprises(): Observable<EntrepriseOption[]> {
    return this.http.get<EntrepriseOption[]>(`${this.apiUrl}/entreprises`);
  }

  getEventTypes(activeOnly = false): Observable<EventType[]> {
    return this.http.get<EventType[]>(`${this.apiUrl}/types${activeOnly ? '/active' : ''}`);
  }

  getEventTypeById(id: number): Observable<EventType> {
    return this.http.get<EventType>(`${this.apiUrl}/types/${id}`);
  }

  uploadEventImage(file: File): Observable<HttpEvent<{ imageUrl: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/images`, formData, {
      observe: 'events',
      reportProgress: true
    });
  }

  createEventType(type: EventType): Observable<EventType> {
    return this.http.post<EventType>(`${this.apiUrl}/types`, type);
  }

  updateEventType(id: number, type: EventType): Observable<EventType> {
    return this.http.put<EventType>(`${this.apiUrl}/types/${id}`, type);
  }

  deleteEventType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/types/${id}`);
  }

  private buildParams(filters: EventFilters | Record<string, string | undefined>): HttpParams {
    let params = new HttpParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && `${value}`.trim() !== '') {
        params = params.set(key, `${value}`.trim());
      }
    });

    return params;
  }
}
