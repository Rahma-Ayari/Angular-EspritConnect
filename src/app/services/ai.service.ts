import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AIDescriptionRequest {
  titre: string;
  typeOffre: string;
  domaine?: string;
  localisation?: string;
  briefNotes?: string;
}

export interface AIDescriptionResponse {
  suggestedDescription: string;
  suggestedSkills: string[];
  aiDisclaimer?: string;
}

@Injectable({ providedIn: 'root' })
export class AIService {
  private readonly base = `${environment.apiUrl}/offres`;

  constructor(private http: HttpClient) {}

  generateJobDescription(request: AIDescriptionRequest): Observable<AIDescriptionResponse> {
    return this.http.post<AIDescriptionResponse>(`${this.base}/ai/suggest`, request);
  }
}
