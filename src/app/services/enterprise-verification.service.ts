import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type VerificationStatus = 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface EnterpriseVerification {
  userId: string;
  nom: string;
  email: string;
  businessRegistrationNumber: string;
  companySector: string;
  companyWebsite: string;
  companyDescription: string;
  verificationDocumentName: string;
  hasDocument: boolean;
  verificationStatus: VerificationStatus;
  verificationNotes: string;
  verifiedAt: string;
  verifiedBy: string;
  createdAt: string;
}

export interface VerificationStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  notSubmitted: number;
}

export interface ScoreBreakdown {
  criteria: string;
  points: number;
  maxPoints: number;
  passed: boolean;
}

export interface AutoVerificationResult {
  totalScore: number;
  breakdown: ScoreBreakdown[];
  recommendation: 'APPROVE' | 'MANUAL_REVIEW' | 'INSUFFICIENT';
  recommendationText: string;
}

export interface VerificationActionRequest {
  status: VerificationStatus;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnterpriseVerificationService {
  private apiUrl = `${environment.apiUrl}/enterprise-verification`;

  constructor(private http: HttpClient) {}

  uploadVerificationDocument(
    file: File,
    businessRegistrationNumber?: string,
    companySector?: string,
    companyWebsite?: string,
    companyDescription?: string
  ): Observable<EnterpriseVerification> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (businessRegistrationNumber) {
      formData.append('businessRegistrationNumber', businessRegistrationNumber);
    }
    if (companySector) {
      formData.append('companySector', companySector);
    }
    if (companyWebsite) {
      formData.append('companyWebsite', companyWebsite);
    }
    if (companyDescription) {
      formData.append('companyDescription', companyDescription);
    }

    return this.http.post<EnterpriseVerification>(`${this.apiUrl}/upload-document`, formData);
  }

  getMyVerificationStatus(): Observable<EnterpriseVerification> {
    return this.http.get<EnterpriseVerification>(`${this.apiUrl}/my-status`);
  }

  getPendingVerifications(): Observable<EnterpriseVerification[]> {
    return this.http.get<EnterpriseVerification[]>(`${this.apiUrl}/pending`);
  }

  getAllEnterprises(status?: VerificationStatus, search?: string): Observable<EnterpriseVerification[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<EnterpriseVerification[]>(`${this.apiUrl}/all`, { params });
  }

  getVerificationStats(): Observable<VerificationStats> {
    return this.http.get<VerificationStats>(`${this.apiUrl}/stats`);
  }

  getVerificationDocument(userId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/document/${userId}`, {
      responseType: 'blob'
    });
  }

  verifyEnterprise(userId: string, status: VerificationStatus, notes?: string): Observable<EnterpriseVerification> {
    const request: VerificationActionRequest = { status, notes };
    return this.http.post<EnterpriseVerification>(`${this.apiUrl}/${userId}/verify`, request);
  }

  requestResubmission(userId: string, reason?: string): Observable<EnterpriseVerification> {
    let params = new HttpParams();
    if (reason) {
      params = params.set('reason', reason);
    }
    return this.http.post<EnterpriseVerification>(`${this.apiUrl}/${userId}/request-resubmission`, {}, { params });
  }

  runAutoVerification(userId: string): Observable<AutoVerificationResult> {
    return this.http.post<AutoVerificationResult>(`${this.apiUrl}/${userId}/auto-verify`, {});
  }

  getStatusLabel(status: VerificationStatus): string {
    const labels: Record<VerificationStatus, string> = {
      'NOT_SUBMITTED': 'No soumis',
      'PENDING': 'Pending',
      'VERIFIED': 'Verified',
      'REJECTED': 'Rejected'
    };
    return labels[status] || status;
  }

  getStatusClass(status: VerificationStatus): string {
    const classes: Record<VerificationStatus, string> = {
      'NOT_SUBMITTED': 'status-not-submitted',
      'PENDING': 'status-pending',
      'VERIFIED': 'status-verified',
      'REJECTED': 'status-rejected'
    };
    return classes[status] || '';
  }
}
