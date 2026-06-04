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

  // Fields from registration
  niveau?: string;
  filiere?: string;
  anneePromotion?: number;
  domaine?: string;
  disponibleMentorat?: boolean;
  entrepriseActuelle?: string;
  registreCommerce?: string;
  secteurActivite?: string;
  descriptionEntreprise?: string;
}

// Fields accepted by the backend ProfilRequestDTO
// Any field NOT in this list will be stripped before sending
const ALLOWED_FIELDS: (keyof Profile)[] = [
  'userId', 'photo', 'lienLinkedIn', 'bio', 'lienGitHub',
  'prenom', 'telephone', 'adresse', 'ville', 'pays', 'codePostal',
  'siteWeb', 'dateNaissance', 'genre', 'nomProprietaire',
  'niveau', 'filiere', 'anneePromotion', 'domaine',
  'disponibleMentorat', 'entrepriseActuelle',
  'registreCommerce', 'secteurActivite', 'descriptionEntreprise'
];

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

  /**
   * Build a clean payload containing only the fields accepted by ProfilRequestDTO.
   * Strips response-only fields like idProfil, typeProprietaire, etc.
   */
  private buildPayload(profile: Profile): Record<string, any> {
    const payload: Record<string, any> = {};
    for (const key of ALLOWED_FIELDS) {
      const value = profile[key];
      if (value !== undefined && value !== null) {
        payload[key] = value;
      }
    }
    return payload;
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

  /**
   * Update an existing profile (JSON).
   * The photo field can contain a base64 DataURL string — the backend
   * stores it in a LONGTEXT column, so this is fine.
   */
  updateProfile(profileId: number, profile: Profile): Observable<Profile> {
    const payload = this.buildPayload(profile);
    return this.http.put<Profile>(`${this.apiUrl}/${profileId}`, payload, {
      headers: this.getAuthHeaders()
    });
  }

  /** Alias kept for backward-compatibility with components using FormData name */
  updateProfileFormData(profileId: number, profile: Profile): Observable<Profile> {
    return this.updateProfile(profileId, profile);
  }

  /** Create a new profile (JSON). */
  createProfile(profile: Profile): Observable<Profile> {
    const payload = this.buildPayload(profile);
    return this.http.post<Profile>(this.apiUrl, payload, {
      headers: this.getAuthHeaders()
    });
  }

  /** Alias kept for backward-compatibility with components using FormData name */
  createProfileFormData(profile: Profile): Observable<Profile> {
    return this.createProfile(profile);
  }
}
