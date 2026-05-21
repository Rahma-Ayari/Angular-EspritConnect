import { Component, OnInit } from '@angular/core';
import { 
  EnterpriseVerificationService, 
  EnterpriseVerification, 
  VerificationStats, 
  VerificationStatus,
  AutoVerificationResult
} from '../../../services/enterprise-verification.service';
import { VerificationValidatorService } from '../../../services/verification-validator.service';

@Component({
  selector: 'app-enterprise-verification',
  templateUrl: './enterprise-verification.component.html',
  styleUrls: ['./enterprise-verification.component.css']
})
export class EnterpriseVerificationComponent implements OnInit {
  stats: VerificationStats | null = null;
  pendingEnterprises: EnterpriseVerification[] = [];
  allEnterprises: EnterpriseVerification[] = [];
  filteredEnterprises: EnterpriseVerification[] = [];
  
  loading = true;
  actionLoading = false;
  error: string | null = null;
  success: string | null = null;

  activeTab: 'pending' | 'all' = 'pending';
  searchTerm = '';
  statusFilter: VerificationStatus | '' = '';

  showVerifyModal = false;
  showAutoVerifyModal = false;
  showResubmitModal = false;
  selectedEnterprise: EnterpriseVerification | null = null;
  autoVerifyResult: AutoVerificationResult | null = null;
  verificationNotes = '';
  resubmitReason = '';

  constructor(
    private verificationService: EnterpriseVerificationService,
    private validatorService: VerificationValidatorService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    Promise.all([
      this.verificationService.getVerificationStats().toPromise(),
      this.verificationService.getPendingVerifications().toPromise(),
      this.verificationService.getAllEnterprises().toPromise()
    ]).then(([stats, pending, all]) => {
      this.stats = stats || null;
      this.pendingEnterprises = pending || [];
      this.allEnterprises = all || [];
      this.applyFilters();
      this.loading = false;
    }).catch(err => {
      this.error = 'Erreur lors du chargement des données';
      this.loading = false;
      console.error(err);
    });
  }

  switchTab(tab: 'pending' | 'all'): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  applyFilters(): void {
    let enterprises = this.activeTab === 'pending' ? this.pendingEnterprises : this.allEnterprises;

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      enterprises = enterprises.filter(e => 
        e.nom.toLowerCase().includes(search) ||
        e.email.toLowerCase().includes(search) ||
        (e.businessRegistrationNumber && e.businessRegistrationNumber.toLowerCase().includes(search))
      );
    }

    if (this.statusFilter && this.activeTab === 'all') {
      enterprises = enterprises.filter(e => e.verificationStatus === this.statusFilter);
    }

    this.filteredEnterprises = enterprises;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  viewDocument(enterprise: EnterpriseVerification): void {
    if (!enterprise.hasDocument) {
      this.error = 'Aucun document disponible';
      return;
    }

    this.verificationService.getVerificationDocument(enterprise.userId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (err) => {
        this.error = 'Erreur lors du téléchargement du document';
        console.error(err);
      }
    });
  }

  openAutoVerifyModal(enterprise: EnterpriseVerification): void {
    this.selectedEnterprise = enterprise;
    this.autoVerifyResult = null;
    this.showAutoVerifyModal = true;

    this.verificationService.runAutoVerification(enterprise.userId).subscribe({
      next: (result) => {
        this.autoVerifyResult = result;
      },
      error: (err) => {
        this.error = 'Erreur lors de la vérification automatique';
        this.showAutoVerifyModal = false;
        console.error(err);
      }
    });
  }

  closeAutoVerifyModal(): void {
    this.showAutoVerifyModal = false;
    this.selectedEnterprise = null;
    this.autoVerifyResult = null;
  }

  openVerifyModal(enterprise: EnterpriseVerification, action: 'approve' | 'reject'): void {
    this.selectedEnterprise = enterprise;
    this.verificationNotes = '';
    this.showVerifyModal = true;
  }

  closeVerifyModal(): void {
    this.showVerifyModal = false;
    this.selectedEnterprise = null;
    this.verificationNotes = '';
  }

  approveEnterprise(): void {
    if (!this.selectedEnterprise) return;

    this.actionLoading = true;
    this.verificationService.verifyEnterprise(
      this.selectedEnterprise.userId, 
      'VERIFIED', 
      this.verificationNotes
    ).subscribe({
      next: () => {
        this.success = 'Entreprise approuvée avec succès';
        this.closeVerifyModal();
        this.loadData();
        this.actionLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de l\'approbation';
        this.actionLoading = false;
        console.error(err);
      }
    });
  }

  rejectEnterprise(): void {
    if (!this.selectedEnterprise) return;

    this.actionLoading = true;
    this.verificationService.verifyEnterprise(
      this.selectedEnterprise.userId, 
      'REJECTED', 
      this.verificationNotes
    ).subscribe({
      next: () => {
        this.success = 'Entreprise refusée';
        this.closeVerifyModal();
        this.loadData();
        this.actionLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du refus';
        this.actionLoading = false;
        console.error(err);
      }
    });
  }

  openResubmitModal(enterprise: EnterpriseVerification): void {
    this.selectedEnterprise = enterprise;
    this.resubmitReason = '';
    this.showResubmitModal = true;
  }

  closeResubmitModal(): void {
    this.showResubmitModal = false;
    this.selectedEnterprise = null;
    this.resubmitReason = '';
  }

  requestResubmission(): void {
    if (!this.selectedEnterprise) return;

    this.actionLoading = true;
    this.verificationService.requestResubmission(
      this.selectedEnterprise.userId, 
      this.resubmitReason
    ).subscribe({
      next: () => {
        this.success = 'Demande de re-soumission envoyée';
        this.closeResubmitModal();
        this.loadData();
        this.actionLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la demande de re-soumission';
        this.actionLoading = false;
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

  getScoreClass(score: number): string {
    return this.validatorService.getScoreClass(score);
  }

  getRecommendationClass(recommendation: string): string {
    return this.validatorService.getRecommendationClass(recommendation);
  }

  dismissError(): void {
    this.error = null;
  }

  dismissSuccess(): void {
    this.success = null;
  }
}
