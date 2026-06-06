import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map as rxMap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth.service';
import { StudentProfile } from '../models/student-job.model';
import { ExperienceLevel } from '../../jobs/models/job.model';

interface EtudiantMeResponse {
  idEtudiant: number;
  nom: string;
  email: string;
  filiere?: string;
}

interface AlumniMeResponse {
  idAlumni: number;
  nom: string;
  email: string;
  domaine?: string;
}

@Injectable({ providedIn: 'root' })
export class StudentContextService {
  private profile$?: Observable<StudentProfile>;

  constructor(private http: HttpClient, private auth: AuthService) {}

  getProfile(): Observable<StudentProfile> {
    if (!this.profile$) {
      const role = (this.auth.getRole() || 'ETUDIANT').toUpperCase();
      const user = this.auth.getCurrentUser();
      this.profile$ = this.fetchProfile(role, user?.nom || '', user?.email || '').pipe(
        shareReplay(1)
      );
    }
    return this.profile$;
  }

  getEtudiantId(): Observable<number | null> {
    return this.getProfile().pipe(
      rxMap((p) => (p.role === 'ETUDIANT' ? p.etudiantId ?? null : null))
    );
  }

  private fetchProfile(
    role: string,
    fallbackNom: string,
    fallbackEmail: string
  ): Observable<StudentProfile> {
    const fallback = (): Observable<StudentProfile> =>
      of({
        role: role as 'ETUDIANT' | 'ALUMNI',
        nom: fallbackNom || 'Student',
        email: fallbackEmail,
        skills: ['JavaScript', 'Angular', 'Communication'],
        experienceLevel: 'JUNIOR' as ExperienceLevel
      });

    if (role === 'ALUMNI') {
      return this.http
        .get<AlumniMeResponse>(`${environment.apiUrl}/alumni/me`)
        .pipe(
          rxMap((data) => this.buildAlumniProfile(data, fallbackNom)),
          catchError(() => fallback())
        );
    }

    return this.http
      .get<EtudiantMeResponse>(`${environment.apiUrl}/etudiants/me`)
      .pipe(
        rxMap((data) => this.buildEtudiantProfile(data, fallbackNom)),
        catchError(() => fallback())
      );
  }

  private buildEtudiantProfile(data: EtudiantMeResponse, fallbackNom: string): StudentProfile {
    return {
      role: 'ETUDIANT',
      etudiantId: data.idEtudiant,
      nom: data.nom || fallbackNom,
      email: data.email,
      filiere: data.filiere,
      skills: this.inferSkillsFromFiliere(data.filiere),
      experienceLevel: 'JUNIOR'
    };
  }

  private buildAlumniProfile(data: AlumniMeResponse, fallbackNom: string): StudentProfile {
    return {
      role: 'ALUMNI',
      alumniId: data.idAlumni,
      nom: data.nom || fallbackNom,
      email: data.email,
      domaine: data.domaine,
      skills: this.inferSkillsFromDomain(data.domaine),
      experienceLevel: 'INTERMEDIATE'
    };
  }

  private inferSkillsFromFiliere(filiere?: string): string[] {
    const f = (filiere || '').toLowerCase();
    if (f.includes('info') || f.includes('gl') || f.includes('gi')) {
      return ['Java', 'Spring Boot', 'Angular', 'SQL', 'Git'];
    }
    if (f.includes('finance')) return ['Excel', 'Financial Analysis', 'SQL'];
    return ['Communication', 'Teamwork', 'Problem Solving'];
  }

  private inferSkillsFromDomain(domaine?: string): string[] {
    const d = (domaine || '').toLowerCase();
    if (d.includes('dev') || d.includes('software')) {
      return ['React', 'Node.js', 'TypeScript', 'Docker'];
    }
    return ['Project Management', 'Communication', 'Leadership'];
  }
}
