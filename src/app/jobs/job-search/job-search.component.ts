import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { Offre, OffreType } from '../../models/offre.model';
import { StudentJobsService } from '../../services/student-jobs.service';

@Component({
  selector: 'app-job-search',
  templateUrl: './job-search.component.html',
  styleUrls: ['./job-search.component.css']
})
export class JobSearchComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  filterForm!: FormGroup;
  loading = false;
  offers: Offre[] = [];

  readonly types: { value: OffreType | ''; label: string }[] = [
    { value: '', label: 'Tous types' },
    { value: 'STAGE', label: 'Internship' },
    { value: 'EMPLOI', label: 'Job' },
    { value: 'APPRENTISSAGE', label: 'Apprentissage' }
  ];

  constructor(
    private fb: FormBuilder,
    private jobs: StudentJobsService
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      domaine: [''],
      localisation: [''],
      typeOffre: ['' as OffreType | '']
    });
    this.search();
    this.filterForm.valueChanges
      .pipe(debounceTime(350), takeUntil(this.destroy$))
      .subscribe(() => this.search());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  search(): void {
    this.loading = true;
    const v = this.filterForm.value;
    this.jobs.search({
      domaine: v.domaine || undefined,
      localisation: v.localisation || undefined,
      typeOffre: v.typeOffre || undefined
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (list) => {
        this.offers = list;
        this.loading = false;
      },
      error: () => {
        this.offers = [];
        this.loading = false;
      }
    });
  }
}
