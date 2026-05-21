import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  DigestConfigRequestDTO,
  DigestConfigResponseDTO,
  DigestPreviewResponseDTO
} from '../models/digest.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DigestConfigService {
  private base = 'http://localhost:8088/espritconnect';

  constructor(private http: HttpClient) {}

  getConfig(): Observable<DigestConfigResponseDTO> {
    return this.http.get<DigestConfigResponseDTO>(`${this.base}/api/digest-config`);
  }

  updateConfig(dto: DigestConfigRequestDTO): Observable<DigestConfigResponseDTO> {
    return this.http.put<DigestConfigResponseDTO>(`${this.base}/api/digest-config`, dto);
  }

  resetTemplate(): Observable<DigestConfigResponseDTO> {
    return this.http.post<DigestConfigResponseDTO>(`${this.base}/api/digest-config/reset`, {});
  }

  clearTemplate(): Observable<void> {
    return this.http.delete<void>(`${this.base}/api/digest-config/clear`);
  }

  uploadBanner(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/api/digest-config/upload`, form);
  }

  getPreview(): Observable<DigestPreviewResponseDTO> {
    return this.http.get<DigestPreviewResponseDTO>(`${this.base}/api/activity-digest/preview`);
  }

  sendDigestNow(): Observable<void> {
    return this.http.post<void>(`${this.base}/api/activity-digest/send`, {});
  }
}