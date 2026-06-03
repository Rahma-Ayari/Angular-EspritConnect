import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

export interface Profile {
  idProfil?: number;
  userId?: string;
  photo?: string;
  lienLinkedIn?: string;
  bio?: string;
  lienGitHub?: string;
  prenom?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  codePostal?: string;
  siteWeb?: string;
  dateNaissance?: string;
  genre?: string;
  nomProprietaire?: string;
  typeProprietaire?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8089/espritconnect/api/profils';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getCurrentUserProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/current`, {
      headers: this.getAuthHeaders()
    });
  }

  getProfileByUserId(userId: string): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/user/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfile(profileId: number, profile: Profile): Observable<Profile> {
    // Only send fields that exist in the backend's ProfilRequestDTO
    const payload: any = {
      userId: profile.userId,
      photo: profile.photo || null,
      lienLinkedIn: profile.lienLinkedIn || null,
      bio: profile.bio || null,
      lienGitHub: profile.lienGitHub || null,
      prenom: profile.prenom || null,
      telephone: profile.telephone || null,
      adresse: profile.adresse || null,
      ville: profile.ville || null,
      pays: profile.pays || null,
      codePostal: profile.codePostal || null,
      siteWeb: profile.siteWeb || null,
      dateNaissance: profile.dateNaissance || null,
      genre: profile.genre || null,
      nomProprietaire: profile.nomProprietaire || null
    };
    return this.http.put<Profile>(`${this.apiUrl}/${profileId}`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  createProfile(profile: Profile): Observable<Profile> {
    return this.http.post<Profile>(`${this.apiUrl}`, profile, {
      headers: this.getAuthHeaders()
    });
  }
}
