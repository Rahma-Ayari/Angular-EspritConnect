import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { OffreService } from '../../../services/offre.service';
import { AIService } from '../../../services/ai.service';
import { Offre, OffreType } from '../../../models/offre.model';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-entreprise-jobs',
  templateUrl: './entreprise-jobs.component.html',
  styleUrls: ['./entreprise-jobs.component.css']
})
export class EntrepriseJobsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  jobForm!: FormGroup;
  aiPrompt = '';
  isGeneratingDescription = false;
  isSubmitting = false;
  showSuccessMessage = false;
  errorMessage = '';
  
  myOffers: Offre[] = [];
  showPostForm = false;
  
  offerTypes: { value: OffreType; label: string }[] = [
    { value: 'EMPLOI', label: 'Emploi' },
    { value: 'STAGE', label: 'Stage' },
    { value: 'APPRENTISSAGE', label: 'Apprentissage' }
  ];

  constructor(
    private fb: FormBuilder,
    private offreService: OffreService,
    private aiService: AIService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMyOffers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.jobForm = this.fb.group({
      titre: ['', Validators.required],
      typeOffre: ['EMPLOI', Validators.required],
      domaine: ['', Validators.required],
      localisation: [''],
      salaire: [''],
      competencesRequises: [''],
      description: ['', [Validators.required, Validators.minLength(50)]]
    });
  }

  private loadMyOffers(): void {
    // TODO: Get real entreprise ID from auth service
    const entrepriseId = 1;
    
    this.offreService.listByEntreprise(entrepriseId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (offers) => {
          this.myOffers = offers;
        },
        error: (err) => {
          console.error('Error loading offers:', err);
        }
      });
  }

  generateDescription(): void {
    const formValue = this.jobForm.value;
    
    if (!formValue.titre || !formValue.domaine) {
      this.errorMessage = 'Veuillez renseigner au moins le titre et le domaine';
      return;
    }

    this.isGeneratingDescription = true;
    this.errorMessage = '';

    const competences = formValue.competencesRequises 
      ? formValue.competencesRequises.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    this.aiService.generateJobDescription({
      titre: formValue.titre,
      typeOffre: formValue.typeOffre,
      domaine: formValue.domaine,
      localisation: formValue.localisation,
      briefNotes: this.aiPrompt
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.jobForm.patchValue({
            description: response.suggestedDescription
          });
          if (response.suggestedSkills && response.suggestedSkills.length > 0) {
            const existingSkills = competences;
            const allSkills = [...new Set([...existingSkills, ...response.suggestedSkills])];
            this.jobForm.patchValue({
              competencesRequises: allSkills.join(', ')
            });
          }
          this.isGeneratingDescription = false;
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la génération de la description';
          this.isGeneratingDescription = false;
        }
      });
  }

  submitOffer(): void {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    
    const formValue = this.jobForm.value;
    const competences = formValue.competencesRequises 
      ? formValue.competencesRequises.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    // TODO: Get real entreprise ID from auth service
    const entrepriseId = 1;

    const offerRequest = {
      titre: formValue.titre,
      typeOffre: formValue.typeOffre,
      domaine: formValue.domaine,
      localisation: formValue.localisation || undefined,
      description: formValue.description,
      competencesRequises: competences,
      entrepriseId
    };

    this.offreService.create(offerRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (offer) => {
          this.showSuccessMessage = true;
          this.isSubmitting = false;
          this.jobForm.reset({ typeOffre: 'EMPLOI' });
          this.aiPrompt = '';
          this.showPostForm = false;
          this.loadMyOffers();
          
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 5000);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erreur lors de la publication de l\'offre';
          this.isSubmitting = false;
        }
      });
  }

  togglePostForm(): void {
    this.showPostForm = !this.showPostForm;
    if (!this.showPostForm) {
      this.jobForm.reset({ typeOffre: 'EMPLOI' });
      this.aiPrompt = '';
      this.errorMessage = '';
    }
  }

  deleteOffer(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      return;
    }

    this.offreService.delete(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadMyOffers();
        },
        error: (err) => {
          console.error('Error deleting offer:', err);
        }
      });
  }
}
