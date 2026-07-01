import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Offre } from '../../models/offre.model';
import { StudentJobsService } from '../../services/student-jobs.service';

@Component({
  selector: 'app-job-offer-detail',
  templateUrl: './job-offer-detail.component.html',
  styleUrls: ['./job-offer-detail.component.css']
})
export class JobOfferDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  readonly devStudentId = environment.devStudentId ?? 1;

  loading = true;
  applying = false;
  error = '';
  success = '';
  offer: Offre | null = null;
  applyForm!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private jobs: StudentJobsService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.applyForm = this.fb.group({
      lettreMotivation: ['', [Validators.required, Validators.minLength(50)]]
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Offre introuvable.';
      this.loading = false;
      return;
    }

    this.jobs.getOffer(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (o) => {
        this.offer = o;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger cette offre.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitApplication(): void {
    if (!this.offer?.idOffre || this.applyForm.invalid) {
      this.applyForm.markAllAsTouched();
      return;
    }
    this.applying = true;
    this.error = '';
    this.jobs.apply({
      etudiantId: this.devStudentId,
      offreId: this.offer.idOffre,
      lettreMotivation: this.applyForm.value.lettreMotivation
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.applying = false;
        this.success = 'Candidature envoyée. L\'entreprise verra votre profil dans le classement IA.';
        this.applyForm.disable();
      },
      error: (err) => {
        this.applying = false;
        this.error = err.error?.message || 'Candidature impossible (déjà postulé ?).';
      }
    });
  }

  typeLabel(t?: string): string {
    const map: Record<string, string> = {
      STAGE: 'Stage',
      EMPLOI: 'Emploi',
      APPRENTISSAGE: 'Apprentissage'
    };
    return t ? (map[t] ?? t) : '';
  }
}
