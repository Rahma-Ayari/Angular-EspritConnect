import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Offre, OffreType } from '../models/offre.model';

export interface CandidatureRequest {
  etudiantId: number;
  offreId: number;
  lettreMotivation: string;
}

export interface CandidatureResponse {
  id: number;
  etudiantId: number;
  offreId: number;
  lettreMotivation?: string;
  statutCandidature?: string;
}

@Injectable({ providedIn: 'root' })
export class StudentJobsService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  search(filters: {
    domaine?: string;
    localisation?: string;
    typeOffre?: OffreType;
  }): Observable<Offre[]> {
    const params = new URLSearchParams();
    if (filters.domaine) params.set('domaine', filters.domaine);
    if (filters.localisation) params.set('localisation', filters.localisation);
    if (filters.typeOffre) params.set('typeOffre', filters.typeOffre);
    const q = params.toString();
    return this.http.get<Offre[]>(`${this.api}/offres/public/search${q ? '?' + q : ''}`);
  }

  getOffer(id: number): Observable<Offre> {
    return this.http.get<Offre>(`${this.api}/offres/${id}`);
  }

  apply(body: CandidatureRequest): Observable<CandidatureResponse> {
    return this.http.post<CandidatureResponse>(`${this.api}/candidatures`, body);
  }
}
