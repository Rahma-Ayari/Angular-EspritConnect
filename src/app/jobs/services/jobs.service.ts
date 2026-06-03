import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  JobOffer,
  JobFilter,
  JobFormData,
  ImportJobRequest,
  ImportJobResponse,
  JobStatus
} from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobsService {
  private readonly apiUrl = `${environment.apiUrl}/offres`;

  constructor(private http: HttpClient) {}

  // Get all job offers with filters
  getJobs(filter?: JobFilter): Observable<{ data: JobOffer[]; total: number }> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.search) params = params.set('search', filter.search);
      if (filter.contractType?.length) params = params.set('contractType', filter.contractType.join(','));
      if (filter.status?.length) params = params.set('status', filter.status.join(','));
      if (filter.department) params = params.set('department', filter.department);
      if (filter.location) params = params.set('location', filter.location);
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.limit) params = params.set('limit', filter.limit.toString());
    }

    return this.http.get<{ data: JobOffer[]; total: number }>(this.apiUrl, { params });
  }
  getArchivedJobs(filter?: JobFilter): Observable<{ data: JobOffer[]; total: number }> {
    let params = new HttpParams();
    if (filter?.search) params = params.set('search', filter.search);
    if (filter?.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter?.sortOrder) params = params.set('sortOrder', filter.sortOrder);
    if (filter?.page) params = params.set('page', filter.page.toString());
    if (filter?.limit) params = params.set('limit', filter.limit.toString());
    return this.http.get<{ data: JobOffer[]; total: number }>(`${this.apiUrl}/archived`, { params });
  }

  // Get single job offer
  getJobById(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.apiUrl}/${id}`);
  }

  // Create job offer
  createJob(jobData: Partial<JobOffer>): Observable<JobOffer> {
    return this.http.post<JobOffer>(this.apiUrl, jobData);
  }

  // Update job offer
  updateJob(id: number, jobData: Partial<JobOffer>): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${this.apiUrl}/${id}`, jobData);
  }

  // Delete job offer
  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Duplicate job offer
  duplicateJob(id: number): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.apiUrl}/${id}/duplicate`, {});
  }

  // Archive job offer
  archiveJob(id: number): Observable<JobOffer> {
    return this.http.patch<JobOffer>(`${this.apiUrl}/${id}/archive`, {});
  }

  // Restore archived job
  restoreJob(id: number): Observable<JobOffer> {
    return this.http.patch<JobOffer>(`${this.apiUrl}/${id}/restore`, {});
  }

  // Pause applications
  pauseApplications(id: number): Observable<JobOffer> {
    return this.http.patch<JobOffer>(`${this.apiUrl}/${id}/pause`, {});
  }

  // Resume applications
  resumeApplications(id: number): Observable<JobOffer> {
    return this.http.patch<JobOffer>(`${this.apiUrl}/${id}/resume`, {});
  }

  // Close job offer
  closeJob(id: number): Observable<JobOffer> {
    return this.http.patch<JobOffer>(`${this.apiUrl}/${id}/close`, {});
  }

  // Pin job offer
  pinJob(id: number): Observable<JobOffer> {
    return this.http.patch<JobOffer>(`${this.apiUrl}/${id}/pin`, {});
  }

  // Unpin job offer
  unpinJob(id: number): Observable<JobOffer> {
    return this.http.patch<JobOffer>(`${this.apiUrl}/${id}/unpin`, {});
  }

  // Save draft
  saveDraft(jobData: Partial<JobOffer>): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.apiUrl}/draft`, jobData);
  }

  // Update draft
  updateDraft(id: number, jobData: Partial<JobOffer>): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${this.apiUrl}/draft/${id}`, jobData);
  }

  // Import job from external source
  importJob(importData: ImportJobRequest): Observable<ImportJobResponse> {
    const formData = new FormData();
    
    if (importData.url) {
      formData.append('url', importData.url);
    }
    if (importData.pdfFile) {
      formData.append('file', importData.pdfFile);
    }
    if (importData.rawText) {
      formData.append('text', importData.rawText);
    }
    formData.append('source', importData.source);

    return this.http.post<ImportJobResponse>(`${this.apiUrl}/import`, formData);
  }

  // Get application statistics
  getJobStatistics(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/statistics`);
  }

  // Share job offer
  shareJob(id: number, channels: string[]): Observable<{ shareUrl: string }> {
    return this.http.post<{ shareUrl: string }>(`${this.apiUrl}/${id}/share`, { channels });
  }
}
