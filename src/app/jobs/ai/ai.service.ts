import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JobsAiCacheService } from './ai-cache.service';
import {
  AiCandidateSummaryRequest,
  AiCandidateSummaryResponse,
  AiGenerateRequest,
  AiGenerateResponse,
  AiImportExtractRequest,
  AiImportExtractResponse,
  AiImproveRequest,
  AiJobGenerateWrapper,
  AiMatchCandidateRequest,
  AiMatchCandidateResponse,
  AiRecruitmentInsightsRequest,
  AiRecruitmentInsightsResponse
} from './models/ai.model';

@Injectable({ providedIn: 'root' })
export class JobsAiService {
  private readonly apiUrl = `${environment.apiUrl}/ai`;

  constructor(
    private http: HttpClient,
    private cache: JobsAiCacheService
  ) {}

  getStatus(): Observable<{ configured: boolean; message: string }> {
    return this.http.get<{ configured: boolean; message: string }>(`${this.apiUrl}/status`);
  }

  generateJobDescription(request: AiGenerateRequest, forceRefresh = false): Observable<AiJobGenerateWrapper> {
    const cacheKey = this.cache.buildKey('generate', request);
    if (!forceRefresh) {
      const cached = this.cache.get<AiJobGenerateWrapper>(cacheKey);
      if (cached) return of({ ...cached, cached: true });
    }
    return this.http.post<AiJobGenerateWrapper>(`${this.apiUrl}/generate-job`, request).pipe(
      tap(res => this.cache.set(cacheKey, res))
    );
  }

  improveJobDescription(request: AiImproveRequest, forceRefresh = false): Observable<AiJobGenerateWrapper> {
    const cacheKey = this.cache.buildKey('improve', request);
    if (!forceRefresh) {
      const cached = this.cache.get<AiJobGenerateWrapper>(cacheKey);
      if (cached) return of({ ...cached, cached: true });
    }
    return this.http.post<AiJobGenerateWrapper>(`${this.apiUrl}/improve-job`, request).pipe(
      tap(res => this.cache.set(cacheKey, res))
    );
  }

  /** Flat response for backward-compatible consumers */
  generateJobDescriptionFlat(request: AiGenerateRequest, forceRefresh = false): Observable<AiGenerateResponse & { provider?: string; cached?: boolean }> {
    return this.generateJobDescription(request, forceRefresh).pipe(
      map(w => ({
        ...w.data,
        provider: w.provider,
        cached: w.cached,
        aiDisclaimer: w.aiDisclaimer ?? w.data.aiDisclaimer
      }))
    );
  }

  improveJobDescriptionFlat(request: AiImproveRequest, forceRefresh = false): Observable<AiGenerateResponse & { provider?: string; cached?: boolean }> {
    return this.improveJobDescription(request, forceRefresh).pipe(
      map(w => ({
        ...w.data,
        provider: w.provider,
        cached: w.cached,
        aiDisclaimer: w.aiDisclaimer ?? w.data.aiDisclaimer
      }))
    );
  }

  extractImport(request: AiImportExtractRequest): Observable<AiImportExtractResponse> {
    const cacheKey = this.cache.buildKey('import', request);
    if (!request.forceRefresh) {
      const cached = this.cache.get<AiImportExtractResponse>(cacheKey);
      if (cached) return of({ ...cached, cached: true });
    }
    return this.http.post<AiImportExtractResponse>(`${this.apiUrl}/import-extract`, request).pipe(
      tap(res => this.cache.set(cacheKey, res))
    );
  }

  matchCandidate(request: AiMatchCandidateRequest): Observable<AiMatchCandidateResponse> {
    const cacheKey = this.cache.buildKey('match', request);
    if (!request.forceRefresh) {
      const cached = this.cache.get<AiMatchCandidateResponse>(cacheKey);
      if (cached) return of({ ...cached, cached: true });
    }
    return this.http.post<AiMatchCandidateResponse>(`${this.apiUrl}/match-candidate`, request).pipe(
      tap(res => this.cache.set(cacheKey, res))
    );
  }

  candidateSummary(request: AiCandidateSummaryRequest): Observable<AiCandidateSummaryResponse> {
    const cacheKey = this.cache.buildKey('summary', request);
    if (!request.forceRefresh) {
      const cached = this.cache.get<AiCandidateSummaryResponse>(cacheKey);
      if (cached) return of({ ...cached, cached: true });
    }
    return this.http.post<AiCandidateSummaryResponse>(`${this.apiUrl}/candidate-summary`, request).pipe(
      tap(res => this.cache.set(cacheKey, res))
    );
  }

  recruitmentInsights(request: AiRecruitmentInsightsRequest): Observable<AiRecruitmentInsightsResponse> {
    const cacheKey = this.cache.buildKey('insights', request);
    if (!request.forceRefresh) {
      const cached = this.cache.get<AiRecruitmentInsightsResponse>(cacheKey);
      if (cached) return of({ ...cached, cached: true });
    }
    return this.http.post<AiRecruitmentInsightsResponse>(`${this.apiUrl}/recruitment-insights`, request).pipe(
      tap(res => this.cache.set(cacheKey, res))
    );
  }
}
