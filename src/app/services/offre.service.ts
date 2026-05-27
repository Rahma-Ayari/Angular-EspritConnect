import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Offre, OffreRequest } from '../models/offre.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OffreService {
  private readonly base = `${environment.apiUrl}/offres`;

  constructor(private http: HttpClient) {}

  listByEntreprise(entrepriseId: number): Observable<Offre[]> {
    return this.http.get<Offre[]>(`${this.base}/entreprise/${entrepriseId}`);
  }

  create(body: OffreRequest): Observable<Offre> {
    return this.http.post<Offre>(this.base, body);
  }

  update(id: number, body: OffreRequest): Observable<Offre> {
    return this.http.put<Offre>(`${this.base}/${id}`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
