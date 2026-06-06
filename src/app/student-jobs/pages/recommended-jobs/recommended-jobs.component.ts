import { Component, OnInit } from '@angular/core';
import { JobOffer } from '../../../jobs/models/job.model';
import { StudentJobsBrowseService } from '../../services/student-jobs-browse.service';
import { MatchScoreService } from '../../services/match-score.service';
import { StudentContextService } from '../../services/student-context.service';
import { RecommendedJob, StudentProfile } from '../../models/student-job.model';

@Component({
  selector: 'app-recommended-jobs',
  templateUrl: './recommended-jobs.component.html',
  styleUrls: ['./recommended-jobs.component.css']
})
export class RecommendedJobsComponent implements OnInit {
  profile?: StudentProfile;
  highMatch: RecommendedJob[] = [];
  recommended: RecommendedJob[] = [];
  trending: RecommendedJob[] = [];
  internships: RecommendedJob[] = [];
  loading = true;

  constructor(
    private browse: StudentJobsBrowseService,
    private matchScore: MatchScoreService,
    private studentContext: StudentContextService
  ) {}

  ngOnInit(): void {
    this.studentContext.getProfile().subscribe((profile) => {
      this.profile = profile;
      this.browse.search({ limit: 50, page: 1 }).subscribe({
        next: (res) => {
          const scored = res.data.map((job) => this.toRecommended(job, profile));
          scored.sort((a, b) => b.matchScore - a.matchScore);
          this.highMatch = scored.filter((j) => j.matchScore >= 80).slice(0, 5);
          this.recommended = scored.slice(0, 6);
          this.trending = [...scored]
            .sort((a, b) => (b.applicationCount || 0) - (a.applicationCount || 0))
            .slice(0, 4);
          this.internships = scored
            .filter((j) => j.contractType === 'STAGE' || j.contractType === 'PFE')
            .slice(0, 4);
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
    });
  }

  private toRecommended(job: JobOffer, profile: StudentProfile): RecommendedJob {
    const match = this.matchScore.calculate(job, profile);
    let reason = `Strong ${match.label.toLowerCase()} based on your skills`;
    if (job.contractType === 'STAGE') reason = 'Internship aligned with your academic path';
    if ((job.applicationCount || 0) > 2) reason = 'Trending role with growing applicant interest';
    if (match.skills >= 85) reason = 'Your skills closely match required technologies';
    return { ...job, matchScore: match.overall, reason };
  }
}
