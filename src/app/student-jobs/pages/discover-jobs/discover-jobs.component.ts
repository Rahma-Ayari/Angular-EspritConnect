import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';
import {
  JobOffer,
  ContractType,
  WorkMode,
  CONTRACT_TYPE_LABELS,
  WORK_MODE_LABELS
} from '../../../jobs/models/job.model';
import { StudentJobsBrowseService } from '../../services/student-jobs-browse.service';
import { MatchScoreService } from '../../services/match-score.service';
import { SavedJobsService } from '../../services/saved-jobs.service';
import { StudentContextService } from '../../services/student-context.service';
import { MatchBreakdown, StudentProfile } from '../../models/student-job.model';

@Component({
  selector: 'app-discover-jobs',
  templateUrl: './discover-jobs.component.html',
  styleUrls: ['./discover-jobs.component.css']
})
export class DiscoverJobsComponent implements OnInit {
  filterForm!: FormGroup;
  jobs: JobOffer[] = [];
  matches = new Map<number, MatchBreakdown>();
  loading = true;
  total = 0;
  page = 1;
  limit = 8;
  profile?: StudentProfile;
  showFilters = false;

  readonly contractLabels = CONTRACT_TYPE_LABELS;
  readonly workModeLabels = WORK_MODE_LABELS;
  readonly contractOptions = Object.keys(CONTRACT_TYPE_LABELS) as ContractType[];
  readonly workModeOptions = Object.keys(WORK_MODE_LABELS) as WorkMode[];

  contractLabel(type: ContractType): string {
    return this.contractLabels[type];
  }

  workModeLabel(mode: WorkMode): string {
    return this.workModeLabels[mode];
  }

  constructor(
    private fb: FormBuilder,
    private browse: StudentJobsBrowseService,
    private matchScore: MatchScoreService,
    private savedJobs: SavedJobsService,
    private studentContext: StudentContextService
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      search: [''],
      location: [''],
      workMode: [''],
      contractType: [''],
      skills: [''],
      salaryMin: [''],
      company: [''],
      sortBy: ['recent']
    });

    this.studentContext.getProfile().subscribe((p) => {
      this.profile = p;
      this.computeMatches();
    });

    this.filterForm.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.page = 1;
      this.loadJobs();
    });

    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    const v = this.filterForm.value;
    this.browse
      .search({
        search: v.search || undefined,
        location: v.location || undefined,
        workMode: v.workMode ? [v.workMode] : undefined,
        contractType: v.contractType ? [v.contractType] : undefined,
        skills: v.skills
          ? v.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
          : undefined,
        salaryMin: v.salaryMin ? Number(v.salaryMin) : undefined,
        company: v.company || undefined,
        sortBy: v.sortBy,
        page: this.page,
        limit: this.limit
      })
      .subscribe({
        next: (res) => {
          this.jobs = res.data;
          this.total = res.total;
          this.computeMatches();
          this.loading = false;
        },
        error: () => {
          this.jobs = [];
          this.loading = false;
        }
      });
  }

  computeMatches(): void {
    if (!this.profile) return;
    this.matches.clear();
    for (const job of this.jobs) {
      if (job.id) {
        this.matches.set(job.id, this.matchScore.calculate(job, this.profile));
      }
    }
  }

  isSaved(jobId?: number): boolean {
    return jobId ? this.savedJobs.isSaved(jobId) : false;
  }

  toggleSave(job: JobOffer): void {
    if (job.id) this.savedJobs.toggle(job.id);
  }

  shareJob(job: JobOffer): void {
    const url = `${window.location.origin}/dashboard/jobs/${job.id}`;
    navigator.clipboard?.writeText(url);
  }

  searchNow(): void {
    this.page = 1;
    this.loadJobs();
  }

  nextPage(): void {
    if (this.page * this.limit < this.total) {
      this.page++;
      this.loadJobs();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadJobs();
    }
  }

  getMatch(job: JobOffer): MatchBreakdown | undefined {
    return job.id ? this.matches.get(job.id) : undefined;
  }
}
