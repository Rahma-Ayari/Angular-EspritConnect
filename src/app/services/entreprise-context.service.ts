import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, shareReplay, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EntrepriseMe {
  idEntreprise: number;
  nom: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class EntrepriseContextService {
  private entrepriseId$?: Observable<number>;

  constructor(private http: HttpClient) {}

  getEntrepriseId(): Observable<number> {
    if (!this.entrepriseId$) {
      this.entrepriseId$ = this.http
        .get<EntrepriseMe>(`${environment.apiUrl}/entreprises/me`)
        .pipe(
          map((e) => {
            if (!e?.idEntreprise) {
              throw new Error('Entreprise ID missing');
            }
            return e.idEntreprise;
          }),
          catchError((err) => {
            const msg =
              err?.error?.message ||
              err?.error?.error ||
              'Could not load your enterprise profile. Sign in with an enterprise account.';
            return throwError(() => ({ ...err, message: msg }));
          }),
          shareReplay(1)
        );
    }
    return this.entrepriseId$;
  }
}
