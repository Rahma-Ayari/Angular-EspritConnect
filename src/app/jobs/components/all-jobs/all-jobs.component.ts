import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, forkJoin, of, switchMap, catchError } from 'rxjs';
import { JobsService } from '../../services/jobs.service';
import { JobsAiService } from '../../ai/ai.service';
import { EntrepriseJobDashboardService } from '../../../services/entreprise-job-dashboard.service';
import { EntrepriseContextService } from '../../../services/entreprise-context.service';
import { navigateJobs } from '../../jobs-router.util';
import { TopMatchCandidate } from '../../ai/models/ai.model';
import { CandidateMatch } from '../../../models/job-dashboard.model';
import {
  JobOffer,
  JobFilter,
  JobStatus,
  ContractType,
  CONTRACT_TYPE_LABELS,
  JOB_STATUS_LABELS
} from '../../models/job.model';

@Component({
  selector: 'app-all-jobs',
  templateUrl: './all-jobs.component.html',
  styleUrls: ['./all-jobs.component.css']
})
export class AllJobsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  jobs: JobOffer[] = [];
  filteredJobs: JobOffer[] = [];
  loading = false;
  error = '';

  // View mode
  viewMode: 'grid' | 'table' = 'table';

  // Filters
  searchQuery = '';
  selectedStatuses: JobStatus[] = [];
  selectedTypes: ContractType[] = [];
  sortBy: 'recent' | 'title' | 'applications' | 'deadline' = 'recent';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Dropdowns
  showStatusFilter = false;
  showTypeFilter = false;
  showSortMenu = false;

  // Constants
  readonly statusOptions = Object.keys(JOB_STATUS_LABELS) as JobStatus[];
  readonly typeOptions = Object.keys(CONTRACT_TYPE_LABELS) as ContractType[];
  readonly statusLabels = JOB_STATUS_LABELS;
  readonly typeLabels = CONTRACT_TYPE_LABELS;

  // Active menu tracking
  activeMenuId: number | null = null;

  // Dashboard tabs
  activeTab: 'offers' | 'top-matches' | 'analytics' = 'offers';
  selectedJobId: number | null = null;
  entrepriseId: number | null = null;

  // AI Top Matches
  topCandidates: TopMatchCandidate[] = [];
  topMatchesLoading = false;
  drawerOpen = false;
  selectedCandidate: TopMatchCandidate | null = null;
  topScores: number[] = [];

  constructor(
    private jobsService: JobsService,
    private jobsAiService: JobsAiService,
    private dashboardService: EntrepriseJobDashboardService,
    private entrepriseContext: EntrepriseContextService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadJobs();
    this.setupSearchDebounce();
    this.entrepriseContext.getEntrepriseId()
      .pipe(takeUntil(this.destroy$))
      .subscribe(id => this.entrepriseId = id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.searchQuery = query;
        this.currentPage = 1;
        this.loadJobs();
      });
  }

  loadJobs(): void {
    this.loading = true;
    this.error = '';

    const filter: JobFilter = {
      search: this.searchQuery || undefined,
      status: this.selectedStatuses.length > 0 ? this.selectedStatuses : undefined,
      contractType: this.selectedTypes.length > 0 ? this.selectedTypes : undefined,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    this.jobsService.getJobs(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.jobs = response.data.map(job => this.normalizeJob(job));
          this.totalItems = response.total;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load job offers';
          this.loading = false;
          console.error('Error loading jobs:', err);
        }
      });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  toggleStatus(status: JobStatus): void {
    const index = this.selectedStatuses.indexOf(status);
    if (index > -1) {
      this.selectedStatuses.splice(index, 1);
    } else {
      this.selectedStatuses.push(status);
    }
    this.currentPage = 1;
    this.loadJobs();
  }

  toggleType(type: ContractType): void {
    const index = this.selectedTypes.indexOf(type);
    if (index > -1) {
      this.selectedTypes.splice(index, 1);
    } else {
      this.selectedTypes.push(type);
    }
    this.currentPage = 1;
    this.loadJobs();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatuses = [];
    this.selectedTypes = [];
    this.currentPage = 1;
    this.loadJobs();
  }

  setSortBy(sortBy: 'recent' | 'title' | 'applications' | 'deadline'): void {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortOrder = 'desc';
    }
    this.showSortMenu = false;
    this.loadJobs();
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadJobs();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  get hasActiveFilters(): boolean {
    return this.searchQuery !== '' || 
           this.selectedStatuses.length > 0 || 
           this.selectedTypes.length > 0;
  }

  get statsTotalOffers(): number {
    return this.totalItems;
  }

  get statsActive(): number {
    return this.jobs.filter(j => j.status === 'ACTIVE').length;
  }

  get statsTotalApplications(): number {
    return this.jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0);
  }

  get statsAvgApplications(): number {
    if (!this.jobs.length) return 0;
    return Math.round(this.statsTotalApplications / this.jobs.length);
  }

  // Navigation
  createJob(): void {
    navigateJobs(this.router, this.route, ['create']);
  }

  editJob(id: number): void {
    navigateJobs(this.router, this.route, ['edit', id]);
  }

  viewJob(id: number): void {
    this.router.navigate(['/job-detail', id]);
  }

  // Job Actions
  onJobAction(action: string, job: JobOffer): void {
    switch (action) {
      case 'edit':
        this.editJob(job.id!);
        break;
      case 'duplicate':
        this.duplicateJob(job.id!);
        break;
      case 'archive':
        this.archiveJob(job.id!);
        break;
      case 'pause':
        this.pauseJob(job.id!);
        break;
      case 'delete':
        this.deleteJob(job.id!);
        break;
      case 'pin':
        this.pinJob(job.id!);
        break;
    }
  }

  duplicateJob(id: number): void {
    this.jobsService.duplicateJob(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadJobs();
        },
        error: (err) => {
          console.error('Error duplicating job:', err);
        }
      });
  }

  archiveJob(id: number | undefined): void {
    const jobId = this.resolveJobId(id);
    if (!jobId) {
      alert('Cannot archive this offer: missing job ID.');
      return;
    }

    if (confirm('Are you sure you want to archive this offer?')) {
      this.activeMenuId = null;
      this.jobsService.archiveJob(jobId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadJobs();
          },
          error: (err) => {
            const message = err.error?.message || 'Failed to archive this offer.';
            alert(message);
            console.error('Error archiving job:', err);
          }
        });
    }
  }

  private resolveJobId(id: number | undefined): number | null {
    if (typeof id === 'number' && !Number.isNaN(id)) {
      return id;
    }
    return null;
  }

  private normalizeJob(job: JobOffer): JobOffer {
    const raw = job as JobOffer & { idOffre?: number };
    return {
      ...job,
      id: job.id ?? raw.idOffre
    };
  }

  pauseJob(id: number): void {
    this.jobsService.pauseApplications(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadJobs();
        },
        error: (err) => {
          console.error('Error pausing job:', err);
        }
      });
  }

  deleteJob(id: number): void {
    if (confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
      this.jobsService.deleteJob(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadJobs();
          },
          error: (err) => {
            console.error('Error deleting job:', err);
          }
        });
    }
  }

  pinJob(id: number): void {
    this.jobsService.pinJob(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadJobs();
        },
        error: (err) => {
          console.error('Error pinning job:', err);
        }
      });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadJobs();
    }
  }

  toggleActionsMenu(id: number | undefined): void {
    if (id === undefined) return;
    this.activeMenuId = this.activeMenuId === id ? null : id;
  }

  navigateToImport(): void {
    navigateJobs(this.router, this.route, ['import']);
  }

  setTab(tab: 'offers' | 'top-matches' | 'analytics'): void {
    this.activeTab = tab;
    if (tab === 'top-matches' && this.selectedJobId) {
      this.loadTopMatches(this.selectedJobId);
    }
  }

  selectJobForMatches(job: JobOffer): void {
    if (!job.id) return;
    this.selectedJobId = job.id;
    this.loadTopMatches(job.id);
  }

  onCandidateSelected(candidate: TopMatchCandidate): void {
    this.selectedCandidate = candidate;
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.selectedCandidate = null;
  }

  private loadTopMatches(offreId: number): void {
    this.topMatchesLoading = true;
    this.dashboardService.topCandidates(offreId, 10)
      .pipe(
        switchMap((candidates) => this.enrichWithAiScores(offreId, candidates)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (enriched) => {
          this.topCandidates = enriched;
          this.topScores = enriched.map(c => c.aiScore ?? c.scoreCompatibilite).filter(s => s > 0);
          this.topMatchesLoading = false;
        },
        error: () => {
          this.topCandidates = [];
          this.topMatchesLoading = false;
        }
      });
  }

  private enrichWithAiScores(offreId: number, candidates: CandidateMatch[]) {
    if (!candidates.length) {
      return of([] as TopMatchCandidate[]);
    }

    const mapped: TopMatchCandidate[] = candidates.map(c => ({
      candidatureId: c.candidatureId,
      etudiantId: c.etudiantId,
      etudiantNom: c.etudiantNom,
      etudiantEmail: c.etudiantEmail,
      filiere: c.filiere,
      scoreCompatibilite: c.scoreCompatibilite,
      skillsMatched: c.skillsMatched || [],
      recommendation: c.recommandations?.[0],
      hasResume: c.hasResume,
      candidatureStatus: c.candidatureStatus
    }));

    const aiCalls = mapped.slice(0, 5).map(c =>
      this.jobsAiService.matchCandidate({
        offreId,
        etudiantId: c.etudiantId,
        candidatureId: c.candidatureId
      }).pipe(
        catchError(() => of(null))
      )
    );

    return forkJoin(aiCalls).pipe(
      switchMap(results => {
        results.forEach((res, i) => {
          if (res && mapped[i]) {
            mapped[i].aiScore = res.overallScore;
            mapped[i].recommendation = res.recommendation;
          }
        });
        return of(mapped);
      })
    );
  }
}
