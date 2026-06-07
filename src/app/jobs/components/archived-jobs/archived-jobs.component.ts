import { Component, OnInit } from '@angular/core';
import { JobsService } from '../../services/jobs.service';
import { JobOffer } from '../../models/job.model';

@Component({
  selector: 'app-archived-jobs',
  templateUrl: './archived-jobs.component.html',
  styleUrls: ['./archived-jobs.component.css']
})
export class ArchivedJobsComponent implements OnInit {
  archivedJobs: JobOffer[] = [];
  loading = false;

  constructor(private jobsService: JobsService) {}

  ngOnInit(): void {
    this.loadArchivedJobs();
  }

  loadArchivedJobs(): void {
    this.loading = true;
    this.jobsService.getArchivedJobs().subscribe({
      next: (response) => {
        this.archivedJobs = response.data.map(job => ({
          ...job,
          id: job.id ?? (job as JobOffer & { idOffre?: number }).idOffre
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  restoreJob(id: number): void {
    this.jobsService.restoreJob(id).subscribe(() => {
      this.loadArchivedJobs();
    });
  }

  deleteJob(id: number): void {
    if (confirm('Permanently delete this offer?')) {
      this.jobsService.deleteJob(id).subscribe(() => {
        this.loadArchivedJobs();
      });
    }
  }
}
