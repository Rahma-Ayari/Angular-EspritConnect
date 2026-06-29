import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  JobApplication,
  mapApplicationUiStatus
} from '../models/student-job.model';
import { StudentContextService } from './student-context.service';

export interface ApplyPayload {
  offreId: number;
  lettreMotivation?: string;
  fichierId?: number;
  yearsExperience?: number;
  willingToRelocate?: boolean;
  availabilityDate?: string;
}

@Injectable({ providedIn: 'root' })
export class ApplicationsService {
  private readonly api = `${environment.apiUrl}/candidatures`;

  constructor(
    private http: HttpClient,
    private studentContext: StudentContextService
  ) {}

  apply(payload: ApplyPayload): Observable<JobApplication> {
    return this.studentContext.getProfile().pipe(
      switchMap((profile) => {
        if (profile.role === 'ALUMNI') {
          return throwError(
            () =>
              new Error(
                'Alumni applications will be enabled soon. Student accounts can apply today.'
              )
          );
        }
        return this.http.post<any>(`${this.api}/me`, payload);
      }),
      map((c) => this.toApplication(c))
    );
  }

  getMyApplications(): Observable<JobApplication[]> {
    return this.studentContext.getEtudiantId().pipe(
      switchMap((id) => {
        if (!id) return of([]);
        return this.http
          .get<any[]>(`${this.api}/student/${id}`)
          .pipe(map((list) => list.map((c) => this.toApplication(c))));
      })
    );
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  private toApplication(c: any): JobApplication {
    const date = c.dateCandidature
      ? typeof c.dateCandidature === 'string'
        ? c.dateCandidature
        : new Date(c.dateCandidature).toISOString()
      : undefined;
    const backend = c.statutCandidature || 'EN_ATTENTE';
    return {
      id: c.id,
      offreId: c.offreId,
      jobTitle: c.jobTitle,
      companyName: c.companyName,
      dateCandidature: date,
      lettreMotivation: c.lettreMotivation,
      backendStatus: backend,
      uiStatus: mapApplicationUiStatus(backend, date),
      scoreMatch: c.scoreMatch
    };
  }
}
