import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CandidateMatch,
  EntrepriseDocument,
  EntrepriseJobDashboardOverview,
  EntrepriseVerification,
  OffreAiSuggestion,
  OffreApplicant
} from '../models/job-dashboard.model';
import { Offre, OffreRequest } from '../models/offre.model';

@Injectable({ providedIn: 'root' })
export class EntrepriseJobDashboardService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOverview(entrepriseId: number): Observable<EntrepriseJobDashboardOverview> {
    return this.http.get<EntrepriseJobDashboardOverview>(
      `${this.api}/entreprises/${entrepriseId}/job-dashboard`
    );
  }

  getVerification(entrepriseId: number): Observable<EntrepriseVerification> {
    return this.http.get<EntrepriseVerification>(
      `${this.api}/entreprises/${entrepriseId}/verification`
    );
  }

  uploadDocument(
    entrepriseId: number,
    documentType: string,
    fileName: string
  ): Observable<EntrepriseDocument> {
    return this.http.post<EntrepriseDocument>(
      `${this.api}/entreprises/${entrepriseId}/verification/documents`,
      { documentType, fileName, fileUrl: `uploaded://${fileName}` }
    );
  }

  submitVerification(entrepriseId: number): Observable<EntrepriseVerification> {
    return this.http.post<EntrepriseVerification>(
      `${this.api}/entreprises/${entrepriseId}/verification/submit`,
      {}
    );
  }

  listOffers(entrepriseId: number): Observable<Offre[]> {
    return this.http.get<Offre[]>(`${this.api}/offres/entreprise/${entrepriseId}`);
  }

  createOffer(body: OffreRequest): Observable<Offre> {
    return this.http.post<Offre>(`${this.api}/offres`, body);
  }

  updateOffer(id: number, body: OffreRequest): Observable<Offre> {
    return this.http.put<Offre>(`${this.api}/offres/${id}`, body);
  }

  deleteOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/offres/${id}`);
  }

  aiSuggest(payload: {
    titre: string;
    typeOffre: string;
    domaine?: string;
    localisation?: string;
    briefNotes?: string;
  }): Observable<OffreAiSuggestion> {
    return this.http.post<OffreAiSuggestion>(`${this.api}/offres/ai/suggest`, payload);
  }

  topCandidates(offreId: number, limit = 10): Observable<CandidateMatch[]> {
    return this.http.get<CandidateMatch[]>(
      `${this.api}/matchings/offre/${offreId}/candidates?limit=${limit}`
    );
  }

  /** Reliable applicant list for an offer (used by Top Matches). */
  getApplicants(offreId: number): Observable<OffreApplicant[]> {
    return this.http.get<OffreApplicant[]>(`${this.api}/candidatures/offre/${offreId}`);
  }

  updateApplicationStatus(
    candidatureId: number,
    statut: 'EN_ENTRETIEN' | 'ACCEPTEE' | 'REFUSEE'
  ): Observable<{ id: number; statutCandidature: string }> {
    return this.http.patch<{ id: number; statutCandidature: string }>(
      `${this.api}/candidatures/${candidatureId}/status`,
      { statut }
    );
  }

  getProfile(entrepriseId: number): Observable<any> {
    return this.http.get<any>(`${this.api}/entreprises/${entrepriseId}`);
  }

  updateProfile(entrepriseId: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.api}/entreprises/${entrepriseId}`, body);
  }
}
