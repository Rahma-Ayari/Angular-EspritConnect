import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, timeout, catchError } from 'rxjs';
import { environment } from '../environments/environment';

export type RegionalDateFormat = 'DD_MM_YYYY' | 'MM_DD_YYYY' | 'YYYY_MM_DD';
export type RegionalTimeFormat = 'HOUR_12' | 'HOUR_24';

export interface RegionalSettings {
  institutionAddress: string;
  locationDetectionEnabled: boolean;
  primaryTimezone: string;
  additionalTimezones: string[];
  dateFormat: RegionalDateFormat;
  timeFormat: RegionalTimeFormat;
  defaultLanguage: string;
  additionalLanguages: string[];
}

@Injectable({ providedIn: 'root' })
export class RegionalSettingsService {
  private readonly API = `${environment.apiUrl}/admin/settings/regional`;
  /** Avoid hanging UI when the backend is down or unreachable through the proxy. */
  private readonly requestMs = 20000;

  constructor(private http: HttpClient) {}

  get(): Observable<RegionalSettings> {
    return this.http.get<RegionalSettings>(this.API).pipe(
      timeout(this.requestMs),
      catchError((err: unknown) => {
        if (isRxjsTimeout(err)) {
          return throwError(() => new Error('TIMEOUT'));
        }
        return throwError(() => err);
      })
    );
  }

  update(body: RegionalSettings): Observable<RegionalSettings> {
    return this.http.put<RegionalSettings>(this.API, body).pipe(
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
