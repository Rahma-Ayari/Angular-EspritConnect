import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SupportTicket,
  SupportTicketRequest,
  TicketMessage,
  TicketMessageRequest,
  TicketCategory,
  TicketStatus
} from '../models/support.model';
import { FAQ, FAQRequest } from '../models/faq.model';
import { ChatbotHistoryItem, ChatbotResponse } from '../models/chatbot.model';
import { AuthService } from '../auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  private readonly frontUrl = `${environment.frontApi}/support`;
  private readonly backUrl = `${environment.backApi}/support`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  get CURRENT_USER_ID(): string {
    return this.authService.getCurrentUser()?.userId ?? '';
  }

  resolveFileUrl(path: string): string {
    if (!path) return path;
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  // --- Frontoffice: tickets ---

  createTicket(ticket: SupportTicketRequest): Observable<SupportTicket> {
    const params = new HttpParams().set('creatorId', this.CURRENT_USER_ID);
    return this.http.post<SupportTicket>(`${this.frontUrl}/tickets`, ticket, { params });
  }

  getMyTickets(): Observable<SupportTicket[]> {
    const params = new HttpParams().set('creatorId', this.CURRENT_USER_ID);
    return this.http.get<SupportTicket[]>(`${this.frontUrl}/tickets/my`, { params });
  }

  getTicketById(id: number): Observable<SupportTicket> {
    return this.http.get<SupportTicket>(`${this.frontUrl}/tickets/${id}`);
  }

  addMessage(ticketId: number, message: TicketMessageRequest): Observable<TicketMessage> {
    const params = new HttpParams().set('senderId', this.CURRENT_USER_ID);
    return this.http.post<TicketMessage>(`${this.frontUrl}/tickets/${ticketId}/messages`, message, { params });
  }

  getMessages(ticketId: number): Observable<TicketMessage[]> {
    return this.http.get<TicketMessage[]>(`${this.frontUrl}/tickets/${ticketId}/messages`);
  }

  reopenTicket(id: number): Observable<SupportTicket> {
    const params = new HttpParams().set('userId', this.CURRENT_USER_ID);
    return this.http.post<SupportTicket>(`${this.frontUrl}/tickets/${id}/reopen`, {}, { params });
  }

  exportTicketHistory(id: number): Observable<Blob> {
    return this.http.get(`${this.frontUrl}/tickets/${id}/export`, { responseType: 'blob' });
  }

  uploadFile(file: File): Observable<{ url: string; fileName: string; status: string; legacyUrl?: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; fileName: string; status: string; legacyUrl?: string }>(
      `${this.frontUrl}/upload`, formData
    );
  }

  // --- Frontoffice: FAQ & chatbot ---

  getCategories(): Observable<TicketCategory[]> {
    return this.http.get<TicketCategory[]>(`${this.frontUrl}/tickets/categories`);
  }

  getAllFAQs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`${this.frontUrl}/faqs`);
  }

  searchFAQs(query: string): Observable<FAQ[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<FAQ[]>(`${this.frontUrl}/faqs/search`, { params });
  }

  getPopularFAQs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`${this.frontUrl}/faqs/popular`);
  }

  getImportantFAQs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`${this.frontUrl}/faqs/important`);
  }

  getFAQsByCategory(categoryId: number): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`${this.frontUrl}/faqs/category/${categoryId}`);
  }

  incrementFAQView(id: number): Observable<FAQ> {
    return this.http.post<FAQ>(`${this.frontUrl}/faqs/${id}/view`, {});
  }

  voteOnFAQ(id: number, helpful: boolean): Observable<FAQ> {
    const params = new HttpParams().set('helpful', helpful.toString());
    return this.http.post<FAQ>(`${this.frontUrl}/faqs/${id}/vote`, {}, { params });
  }

  askChatbot(message: string, history: ChatbotHistoryItem[] = []): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.frontUrl}/chatbot/ask`, { message, history });
  }

  // --- Backoffice: admin ---

  getAllTicketsAdmin(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.backUrl}/tickets`);
  }

  assignTicket(id: number, adminId: string): Observable<SupportTicket> {
    return this.http.patch<SupportTicket>(`${this.backUrl}/tickets/${id}/assign/${adminId}`, {});
  }

  updateTicketStatus(id: number, status: TicketStatus): Observable<SupportTicket> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<SupportTicket>(`${this.backUrl}/tickets/${id}/status`, {}, { params });
  }

  searchAndFilterTickets(status?: string, priority?: string, categoryId?: number, searchQuery?: string): Observable<SupportTicket[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (priority) params = params.set('priority', priority);
    if (categoryId) params = params.set('categoryId', categoryId.toString());
    if (searchQuery) params = params.set('searchQuery', searchQuery);
    return this.http.get<SupportTicket[]>(`${this.backUrl}/tickets/search`, { params });
  }

  createCategory(category: TicketCategory): Observable<TicketCategory> {
    return this.http.post<TicketCategory>(`${this.backUrl}/tickets/categories`, category);
  }

  updateCategory(id: number, category: TicketCategory): Observable<TicketCategory> {
    return this.http.put<TicketCategory>(`${this.backUrl}/tickets/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.backUrl}/tickets/categories/${id}`);
  }

  createFAQ(faq: FAQRequest): Observable<FAQ> {
    return this.http.post<FAQ>(`${this.backUrl}/faqs`, faq);
  }

  updateFAQ(id: number, faq: FAQRequest): Observable<FAQ> {
    return this.http.put<FAQ>(`${this.backUrl}/faqs/${id}`, faq);
  }

  deleteFAQ(id: number): Observable<void> {
    return this.http.delete<void>(`${this.backUrl}/faqs/${id}`);
  }

  markFAQImportant(id: number, important: boolean): Observable<FAQ> {
    const params = new HttpParams().set('important', important.toString());
    return this.http.patch<FAQ>(`${this.backUrl}/faqs/${id}/important`, {}, { params });
  }

  seedData(): Observable<void> {
    return this.http.post<void>(`${this.backUrl}/seed`, {});
  }
}
