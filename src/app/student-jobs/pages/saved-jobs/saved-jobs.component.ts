import { Component, OnInit } from '@angular/core';
import { forkJoin, of, switchMap } from 'rxjs';
import { JobOffer } from '../../../jobs/models/job.model';
import { SavedJobsService } from '../../services/saved-jobs.service';
import { StudentJobsBrowseService } from '../../services/student-jobs-browse.service';

@Component({
  selector: 'app-saved-jobs',
  templateUrl: './saved-jobs.component.html',
  styleUrls: ['./saved-jobs.component.css']
})
export class SavedJobsComponent implements OnInit {
  jobs: JobOffer[] = [];
  loading = true;

  constructor(
    private savedJobs: SavedJobsService,
    private browse: StudentJobsBrowseService
  ) {}

  ngOnInit(): void {
    this.savedJobs.saved$.subscribe(() => this.load());
    this.load();
  }

  load(): void {
    const ids = this.savedJobs.getSavedIds();
    if (!ids.length) {
      this.jobs = [];
      this.loading = false;
      return;
    }
    forkJoin(ids.map((id) => this.browse.getJob(id))).subscribe({
      next: (jobs) => {
        this.jobs = jobs;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  remove(jobId?: number): void {
    if (jobId) this.savedJobs.remove(jobId);
  }
}
