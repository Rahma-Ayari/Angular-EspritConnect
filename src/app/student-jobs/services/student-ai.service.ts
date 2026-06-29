import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  StudentApplicationOptimizerResult,
  StudentCareerAdviceResult,
  StudentCoverLetterResult,
  StudentInterviewPrepResult,
  StudentJobMatchResult,
  StudentResumeOptimizerResult,
  StudentResumeReviewResult
} from '../models/student-ai.model';

@Injectable({ providedIn: 'root' })
export class StudentAiService {
  private readonly api = `${environment.apiUrl}/student-ai`;

  constructor(private http: HttpClient) {}

  getStatus(): Observable<{ configured: boolean; message: string }> {
    return this.http.get<{ configured: boolean; message: string }>(`${this.api}/status`);
  }

  extractResume(file: File): Observable<{ text: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ text: string }>(`${this.api}/extract-resume`, form).pipe(
      catchError((err) => {
        const msg =
          err?.error?.error ||
          err?.error?.message ||
          err?.message ||
          'Could not read this file. Try a PDF, DOCX, or paste the text manually.';
        return throwError(() => new Error(msg));
      })
    );
  }

  jobMatch(offreId: number, resumeText?: string, forceRefresh = false): Observable<StudentJobMatchResult> {
    return this.post<StudentJobMatchResult>('/job-match', { offreId, resumeText, forceRefresh });
  }

  reviewResume(resumeText: string, targetRole?: string, forceRefresh = false): Observable<StudentResumeReviewResult> {
    return this.post<StudentResumeReviewResult>('/review-resume', { resumeText, targetRole, forceRefresh });
  }

  optimizeResume(offreId: number, resumeText: string, forceRefresh = false): Observable<StudentResumeOptimizerResult> {
    return this.post<StudentResumeOptimizerResult>('/optimize-resume', { offreId, resumeText, forceRefresh });
  }

  generateCoverLetter(payload: {
    offreId?: number;
    jobTitle?: string;
    companyName?: string;
    templateStyle?: string;
    additionalNotes?: string;
    forceRefresh?: boolean;
  }): Observable<StudentCoverLetterResult> {
    return this.post<StudentCoverLetterResult>('/generate-cover-letter', payload);
  }

  interviewPreparation(payload: {
    offreId?: number;
    jobTitle?: string;
    jobDescription?: string;
    forceRefresh?: boolean;
  }): Observable<StudentInterviewPrepResult> {
    return this.post<StudentInterviewPrepResult>('/interview-preparation', payload);
  }

  applicationOptimizer(offreId: number, resumeText: string, forceRefresh = false): Observable<StudentApplicationOptimizerResult> {
    return this.post<StudentApplicationOptimizerResult>('/application-optimizer', { offreId, resumeText, forceRefresh });
  }

  careerAdvice(question: string, forceRefresh = false): Observable<StudentCareerAdviceResult> {
    return this.post<StudentCareerAdviceResult>('/career-advice', { question, forceRefresh });
  }

  private post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.api}${path}`, body).pipe(
      catchError((err) => {
        const msg =
          err?.error?.message ||
          err?.error?.error ||
          err?.message ||
          'AI request failed. Check that GEMINI_API_KEY or OPENAI_API_KEY is configured.';
        return throwError(() => new Error(msg));
      })
    );
  }
}
