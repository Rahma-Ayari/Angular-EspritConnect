import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ResumeFile {
  idFichier: number;
  nom: string;
  url: string;
  typeFichier: string;
  taille: number;
}

@Injectable({ providedIn: 'root' })
export class ResumeFilesService {
  private readonly api = `${environment.apiUrl}/fichiers`;

  constructor(private http: HttpClient) {}

  /** Public URL to download/preview a stored file (served from /uploads). */
  fileUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    if (/^https?:\/\//i.test(relativeUrl)) return relativeUrl;
    return `${environment.backendBaseUrl || ''}${relativeUrl}`;
  }

  listMine(): Observable<ResumeFile[]> {
    return this.http
      .get<ResumeFile[]>(`${this.api}/me`)
      .pipe(catchError((e) => throwError(() => this.toError(e))));
  }

  upload(file: File): Observable<ResumeFile> {
    const form = new FormData();
    form.append('file', file);
    return this.http
      .post<ResumeFile>(`${this.api}/upload`, form)
      .pipe(catchError((e) => throwError(() => this.toError(e))));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  private toError(e: any): Error {
    const msg =
      e?.error?.message || e?.error?.error || e?.message || 'File operation failed';
    return new Error(msg);
  }
}
