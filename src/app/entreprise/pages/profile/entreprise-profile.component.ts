import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EntrepriseVerification } from '../../../models/job-dashboard.model';
import { EntrepriseJobDashboardService } from '../../../services/entreprise-job-dashboard.service';

type ActiveSection = 'profile' | 'verification';

@Component({
  selector: 'app-entreprise-profile',
  templateUrl: './entreprise-profile.component.html',
  styleUrls: ['./entreprise-profile.component.css']
})
export class EntrepriseProfileComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  readonly entrepriseId = environment.devEntrepriseId;

  activeSection: ActiveSection = 'profile';
  loading = true;
  savingProfile = false;
  savingDocs = false;
  error = '';
  success = '';

  verification: EntrepriseVerification | null = null;
  profileForm!: FormGroup;

  readonly docTypes = [
    { value: 'REGISTRE_COMMERCE', label: 'Registre de commerce' },
    { value: 'CERTIFICAT_FISCAL', label: 'Certificat fiscal' },
    { value: 'ID_REPRESENTANT', label: 'Representative ID document' },
    { value: 'AUTRE', label: 'Autre justificatif' }
  ];

  selectedDocType = 'REGISTRE_COMMERCE';
  selectedFileName = '';

  constructor(
    private fb: FormBuilder,
    private dashboardService: EntrepriseJobDashboardService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      nom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      secteur: [''],
      siteWeb: [''],
      description: ['']
    });

    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params.get('section') === 'verification') {
        this.activeSection = 'verification';
      }
    });

    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setSection(section: ActiveSection): void {
    this.activeSection = section;
    this.error = '';
    this.success = '';
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    // Load Profile
    this.dashboardService.getProfile(this.entrepriseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.profileForm.patchValue({
            nom: profile.nom,
            email: profile.email,
            secteur: profile.secteur || '',
            siteWeb: profile.siteWeb || '',
            description: profile.description || ''
          });

          // Load Verification Status
          this.loadVerification();
        },
        error: () => {
          this.error = 'Unable to load company profile.';
          this.loading = false;
        }
      });
  }

  loadVerification(): void {
    this.dashboardService.getVerification(this.entrepriseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (v) => {
          this.verification = v;
          this.loading = false;
        },
        error: () => {
          this.error = 'Unable to load verification data.';
          this.loading = false;
        }
      });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.savingProfile = true;
    this.error = '';
    this.success = '';

    // Backend validations require password, we pass a dummy value because the backend update service ignores changing the password anyway.
    const body = {
      ...this.profileForm.value,
      password: 'dummyPassword123'
    };

    this.dashboardService.updateProfile(this.entrepriseId, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (profile) => {
          this.savingProfile = false;
          this.success = 'Profile updated successfully.';
          this.profileForm.patchValue({
            nom: profile.nom,
            email: profile.email,
            secteur: profile.secteur || '',
            siteWeb: profile.siteWeb || '',
            description: profile.description || ''
          });
        },
        error: (err) => {
          this.savingProfile = false;
          this.error = err.error?.message || 'Error updating profile.';
        }
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFileName = file?.name ?? '';
  }

  uploadDocument(): void {
    if (!this.selectedFileName) {
      this.error = 'Choisissez un fichier.';
      return;
    }

    this.savingDocs = true;
    this.error = '';
    this.success = '';

    this.dashboardService.uploadDocument(this.entrepriseId, this.selectedDocType, this.selectedFileName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.savingDocs = false;
          this.success = 'Document saved to your folder.';
          this.selectedFileName = '';
          this.loadVerification();
        },
        error: (err) => {
          this.savingDocs = false;
          this.error = err.error?.message || 'Upload impossible.';
        }
      });
  }

  submitVerification(): void {
    this.savingDocs = true;
    this.error = '';
    this.success = '';

    this.dashboardService.submitVerification(this.entrepriseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (v) => {
          this.savingDocs = false;
          this.verification = v;
          this.success = 'Dossier de vérification envoyé à l\'administration pour revue.';
        },
        error: (err) => {
          this.savingDocs = false;
          this.error = err.error?.message || 'Envoi impossible. Assurez-vous d\'avoir déposé au moins un document.';
        }
      });
  }

  verificationLabel(status?: string): string {
    switch (status) {
      case 'VERIFIED': return 'Verifiede';
      case 'PENDING_REVIEW': return 'En revue admin';
      case 'REJECTED': return 'Rejectede';
      default: return 'Required documents';
    }
  }

  verificationClass(status?: string): string {
    switch (status) {
      case 'VERIFIED': return 'pill-success';
      case 'PENDING_REVIEW': return 'pill-warn';
      case 'REJECTED': return 'pill-danger';
      default: return 'pill-neutral';
    }
  }
}
