import { Component, OnInit } from '@angular/core';
import { 
  EnterpriseVerificationService, 
  EnterpriseVerification, 
  VerificationStatus 
} from '../../../services/enterprise-verification.service';
import { 
  VerificationValidatorService, 
  ConfidenceScore, 
  ValidationResult 
} from '../../../services/verification-validator.service';

@Component({
  selector: 'app-verification-status',
  templateUrl: './verification-status.component.html',
  styleUrls: ['./verification-status.component.css']
})
export class VerificationStatusComponent implements OnInit {
  verification: EnterpriseVerification | null = null;
  loading = true;
  submitting = false;
  error: string | null = null;
  success: string | null = null;

  selectedFile: File | null = null;
  businessRegistrationNumber = '';
  companySector = '';
  companyWebsite = '';
  companyDescription = '';

  rcValidation: ValidationResult = { isValid: true, message: '' };
  websiteValidation: ValidationResult = { isValid: true, message: '' };
  descriptionValidation: ValidationResult = { isValid: true, message: '' };
  confidenceScore: ConfidenceScore | null = null;

  sectors = [
    'Technologies de l\'information',
    'Finance et Banque',
    'Santé et Pharmaceutique',
    'Commerce et Distribution',
    'Industrie et Manufacturing',
    'Construction et BTP',
    'Transport et Logistique',
    'Tourisme et Hôtellerie',
    'Éducation et Education',
    'Services aux companies',
    'Autre'
  ];

  constructor(
    private verificationService: EnterpriseVerificationService,
    private validatorService: VerificationValidatorService
  ) {}

  ngOnInit(): void {
    this.loadVerificationStatus();
  }

  loadVerificationStatus(): void {
    this.loading = true;
    this.error = null;

    this.verificationService.getMyVerificationStatus().subscribe({
      next: (data) => {
        this.verification = data;
        if (data.businessRegistrationNumber) {
          this.businessRegistrationNumber = data.businessRegistrationNumber;
        }
        if (data.companySector) {
          this.companySector = data.companySector;
        }
        if (data.companyWebsite) {
          this.companyWebsite = data.companyWebsite;
        }
        if (data.companyDescription) {
          this.companyDescription = data.companyDescription;
        }
        this.updateConfidenceScore();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading verification status';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Type de fichier non autorisé. Utilisez PDF, JPG ou PNG.';
        this.selectedFile = null;
        return;
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        this.error = 'Le fichier dépasse la taille maximale de 10 Mo.';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.error = null;
      this.updateConfidenceScore();
    }
  }

  onRcNumberChange(): void {
    this.rcValidation = this.validatorService.validateBusinessRegistrationNumber(this.businessRegistrationNumber);
    this.updateConfidenceScore();
  }

  onWebsiteChange(): void {
    this.websiteValidation = this.validatorService.validateWebsite(this.companyWebsite);
    this.updateConfidenceScore();
  }

  onDescriptionChange(): void {
    this.descriptionValidation = this.validatorService.validateDescription(this.companyDescription);
    this.updateConfidenceScore();
  }

  onSectorChange(): void {
    this.updateConfidenceScore();
  }

  updateConfidenceScore(): void {
    const hasDocument = this.selectedFile !== null || (this.verification?.hasDocument ?? false);
    this.confidenceScore = this.validatorService.calculateConfidenceScore(
      hasDocument,
      this.businessRegistrationNumber,
      this.companySector,
      this.companyWebsite,
      this.companyDescription
    );
  }

  canSubmit(): boolean {
    return (
      this.selectedFile !== null &&
      this.businessRegistrationNumber.trim() !== '' &&
      this.rcValidation.isValid &&
      (this.companyWebsite === '' || this.websiteValidation.isValid)
    );
  }

  submitVerification(): void {
    if (!this.selectedFile) {
      this.error = 'Please select a document';
      return;
    }

    if (!this.rcValidation.isValid) {
      this.error = 'Le numéro d\'immatriculation n\'est pas valide';
      return;
    }

    this.submitting = true;
    this.error = null;
    this.success = null;

    this.verificationService.uploadVerificationDocument(
      this.selectedFile,
      this.businessRegistrationNumber,
      this.companySector,
      this.companyWebsite,
      this.companyDescription
    ).subscribe({
      next: (data) => {
        this.verification = data;
        this.selectedFile = null;
        this.success = 'Document submitted successfully. Your request is under verification.';
        this.submitting = false;
        this.updateConfidenceScore();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error submitting document';
        this.submitting = false;
        console.error(err);
      }
    });
  }

  getStatusLabel(status: VerificationStatus): string {
    return this.verificationService.getStatusLabel(status);
  }

  getStatusClass(status: VerificationStatus): string {
    return this.verificationService.getStatusClass(status);
  }

  getScoreColor(score: number): string {
    return this.validatorService.getScoreColor(score);
  }

  getScoreClass(score: number): string {
    return this.validatorService.getScoreClass(score);
  }

  getRecommendationClass(recommendation: string): string {
    return this.validatorService.getRecommendationClass(recommendation);
  }
}
