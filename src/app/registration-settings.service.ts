import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError, timeout } from 'rxjs';
import { environment } from '../environments/environment';

export interface RegistrationSettings {
  linkedInEnabled: boolean;
  facebookEnabled: boolean;
  googleEnabled: boolean;
  ssoEnabled: boolean;
  emailEnabled: boolean;
  appleEnabled: boolean;
  termsAndPrivacyHtml: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrationSettingsService {
  private readonly API = `${environment.apiUrl}/admin/settings/registration`;
  private readonly requestMs = 20000;

  constructor(private http: HttpClient) {}

  get(): Observable<RegistrationSettings> {
    return this.http.get<RegistrationSettings>(this.API).pipe(
      timeout(this.requestMs),
      catchError((err: unknown) => {
        if (isRxjsTimeout(err)) {
          return throwError(() => new Error('TIMEOUT'));
        }
        return throwError(() => err);
      })
    );
  }

  update(body: RegistrationSettings): Observable<RegistrationSettings> {
    return this.http.put<RegistrationSettings>(this.API, body).pipe(
      timeout(this.requestMs),
      catchError((err: unknown) => {
        if (isRxjsTimeout(err)) {
          return throwError(() => new Error('TIMEOUT'));
        }
        return throwError(() => err);
      })
    );
  }
}

function isRxjsTimeout(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { name?: string }).name === 'TimeoutError'
  );
}
