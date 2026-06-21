import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CaptchaChallenge,
  CaptchaVerifyRequest,
  CaptchaVerifyResponse
} from './captcha.models';

@Injectable({ providedIn: 'root' })
export class CaptchaService {
  private readonly API = `${environment.apiUrl}/captcha`;

  constructor(private http: HttpClient) {}

  generate(): Observable<CaptchaChallenge> {
    return this.http.get<CaptchaChallenge>(`${this.API}/generate`);
  }

  verify(request: CaptchaVerifyRequest): Observable<CaptchaVerifyResponse> {
    return this.http.post<CaptchaVerifyResponse>(`${this.API}/verify`, request);
  }
}
