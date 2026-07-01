import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { JobsAiService } from '../ai/ai.service';
import {
  AIGenerateRequest,
  AIGenerateResponse,
  AIImproveRequest
} from '../models/job.model';

/**
 * Backward-compatible facade — delegates to JobsAiService (real LLM via backend).
 */
@Injectable({
  providedIn: 'root'
})
export class JobAIService {
  constructor(private jobsAi: JobsAiService) {}

  generateJobDescription(request: AIGenerateRequest, forceRefresh = false): Observable<AIGenerateResponse & { provider?: string; cached?: boolean }> {
    return this.jobsAi.generateJobDescriptionFlat(request, forceRefresh);
  }

  improveJobDescription(request: AIImproveRequest, forceRefresh = false): Observable<AIGenerateResponse & { provider?: string; cached?: boolean }> {
    return this.jobsAi.improveJobDescriptionFlat(request, forceRefresh);
  }

  extractJobData(text: string): Observable<{
    title: string;
    skills: string[];
    technologies: string[];
    requirements: string;
    experienceLevel: string;
    contractType: string;
  }> {
    return new Observable(observer => {
      this.jobsAi.extractImport({ rawContent: text, source: 'TEXT' }).subscribe({
        next: (res) => {
          observer.next({
            title: res.title,
            skills: res.skills || [],
            technologies: res.skills || [],
            requirements: res.requirements || '',
            experienceLevel: res.experienceLevel as string || '',
            contractType: res.contractType as string || ''
          });
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }
}
