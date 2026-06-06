import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JobOffer, CONTRACT_TYPE_LABELS, WORK_MODE_LABELS } from '../../../jobs/models/job.model';
import { StudentJobsBrowseService } from '../../services/student-jobs-browse.service';
import { MatchScoreService } from '../../services/match-score.service';
import { SavedJobsService } from '../../services/saved-jobs.service';
import { ApplicationsService } from '../../services/applications.service';
import { StudentContextService } from '../../services/student-context.service';
import { MatchBreakdown, StudentProfile } from '../../models/student-job.model';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit {
  job?: JobOffer;
  match?: MatchBreakdown;
  profile?: StudentProfile;
  loading = true;
  applying = false;
  applyError = '';
  applySuccess = false;
  similar: JobOffer[] = [];
  coverLetter = '';

  readonly contractLabels = CONTRACT_TYPE_LABELS;
  readonly workModeLabels = WORK_MODE_LABELS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private browse: StudentJobsBrowseService,
    private matchScore: MatchScoreService,
    private savedJobs: SavedJobsService,
    private applications: ApplicationsService,
    private studentContext: StudentContextService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.studentContext.getProfile().subscribe((p) => {
      this.profile = p;
      if (this.job) this.match = this.matchScore.calculate(this.job, p);
    });

    this.browse.getJob(id).subscribe({
      next: (job) => {
        this.job = job;
        if (this.profile) {
          this.match = this.matchScore.calculate(job, this.profile);
        }
        this.loading = false;
        this.loadSimilar();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadSimilar(): void {
    this.browse.search({ limit: 4, page: 1 }).subscribe((res) => {
      this.similar = res.data.filter((j) => j.id !== this.job?.id).slice(0, 2);
    });
  }

  get initials(): string {
    const name = this.job?.companyName || this.job?.title || 'J';
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  get saved(): boolean {
    return this.job?.id ? this.savedJobs.isSaved(this.job.id) : false;
  }

  get requirementsList(): string[] {
    const text = this.job?.requirements || '';
    return text
      .split(/\n|•|·|-/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10)
      .slice(0, 8);
  }

  get benefitsList(): string[] {
    const text = this.job?.benefits || '';
    return text
      .split(/\n|•|·|-/)
      .map((s) => s.trim())
      .filter((s) => s.length > 3)
      .slice(0, 8);
  }

  toggleSave(): void {
    if (this.job?.id) this.savedJobs.toggle(this.job.id);
  }

  share(): void {
    if (this.job?.id) {
      navigator.clipboard?.writeText(`${window.location.origin}/dashboard/jobs/${this.job.id}`);
    }
  }

  apply(): void {
    if (!this.job?.id) return;
    this.applying = true;
    this.applyError = '';
    this.applications
      .apply({ offreId: this.job.id, lettreMotivation: this.coverLetter || undefined })
      .subscribe({
        next: () => {
          this.applySuccess = true;
          this.applying = false;
        },
        error: (err) => {
          this.applyError = err?.message || err?.error?.error || 'Could not submit application';
          this.applying = false;
        }
      });
  }

  goToJob(id?: number): void {
    if (id) this.router.navigate(['/dashboard/jobs', id]);
  }
}
