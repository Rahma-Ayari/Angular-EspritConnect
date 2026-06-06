import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AIGenerateRequest,
  AIGenerateResponse,
  AIImproveRequest
} from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobAIService {
  private readonly apiUrl = `${environment.apiUrl}/offres/ai`;

  constructor(private http: HttpClient) {}

  /**
   * Generate complete job description using AI
   * @param request Job details for generation
   * @returns Generated job content
   */
  generateJobDescription(request: AIGenerateRequest): Observable<AIGenerateResponse> {
    return this.http.post<AIGenerateResponse>(`${this.apiUrl}/generate`, request);
  }

  /**
   * Improve existing job description using AI
   * @param request Original text and context
   * @returns Improved job content
   */
  improveJobDescription(request: AIImproveRequest): Observable<AIGenerateResponse> {
    return this.http.post<AIGenerateResponse>(`${this.apiUrl}/improve`, request);
  }

  /**
   * Extract key information from raw text
   * @param text Raw job description text
   * @returns Extracted structured data
   */
  extractJobData(text: string): Observable<{
    title: string;
    skills: string[];
    technologies: string[];
    requirements: string;
    experienceLevel: string;
    contractType: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/extract`, { text });
  }

  /**
   * Generate responsibilities based on job title and skills
   * @param title Job title
   * @param skills Required skills
   * @returns Generated responsibilities
   */
  generateResponsibilities(title: string, skills: string[]): Observable<{ responsibilities: string }> {
    return this.http.post<{ responsibilities: string }>(`${this.apiUrl}/responsibilities`, {
      title,
      skills
    });
  }

  /**
   * Generate requirements based on experience level and technologies
   * @param experienceLevel Experience level
   * @param technologies Required technologies
   * @returns Generated requirements
   */
  generateRequirements(
    experienceLevel: string,
    technologies: string[]
  ): Observable<{ requirements: string }> {
    return this.http.post<{ requirements: string }>(`${this.apiUrl}/requirements`, {
      experienceLevel,
      technologies
    });
  }

  /**
   * Generate benefits section
   * @param contractType Contract type
   * @returns Generated benefits
   */
  generateBenefits(contractType: string): Observable<{ benefits: string }> {
    return this.http.post<{ benefits: string }>(`${this.apiUrl}/benefits`, {
      contractType
    });
  }

  /**
   * Suggest skills based on job title and department
   * @param title Job title
   * @param department Department
   * @returns Suggested skills
   */
  suggestSkills(title: string, department?: string): Observable<{ skills: string[] }> {
    return this.http.post<{ skills: string[] }>(`${this.apiUrl}/suggest-skills`, {
      title,
      department
    });
  }

  /**
   * Optimize job description for ATS (Applicant Tracking Systems)
   * @param description Original description
   * @returns Optimized description with keywords
   */
  optimizeForATS(description: string): Observable<{
    optimizedDescription: string;
    keywords: string[];
    score: number;
  }> {
    return this.http.post<any>(`${this.apiUrl}/optimize-ats`, { description });
  }

  /**
   * Translate job description to another language
   * @param text Text to translate
   * @param targetLanguage Target language code
   * @returns Translated text
   */
  translateJobDescription(text: string, targetLanguage: string): Observable<{ translatedText: string }> {
    return this.http.post<{ translatedText: string }>(`${this.apiUrl}/translate`, {
      text,
      targetLanguage
    });
  }

  /**
   * Check grammar and spelling in job description
   * @param text Text to check
   * @returns Corrected text and suggestions
   */
  checkGrammar(text: string): Observable<{
    correctedText: string;
    suggestions: Array<{ original: string; suggestion: string; reason: string }>;
  }> {
    return this.http.post<any>(`${this.apiUrl}/check-grammar`, { text });
  }
}
