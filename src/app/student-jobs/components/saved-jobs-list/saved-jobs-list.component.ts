import { Component, EventEmitter, Input, Output } from '@angular/core';
import { JobOffer } from '../../../jobs/models/job.model';

@Component({
  selector: 'app-saved-jobs-list',
  templateUrl: './saved-jobs-list.component.html',
  styleUrls: ['./saved-jobs-list.component.css']
})
export class SavedJobsListComponent {
  @Input() jobs: JobOffer[] = [];
  @Output() remove = new EventEmitter<number>();
  @Output() share = new EventEmitter<JobOffer>();

  daysUntilDeadline(job: JobOffer): number | null {
    if (!job.deadline) return null;
    return Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  isExpiringSoon(job: JobOffer): boolean {
    const d = this.daysUntilDeadline(job);
    return d !== null && d >= 0 && d <= 7;
  }

  isExpired(job: JobOffer): boolean {
    const d = this.daysUntilDeadline(job);
    return d !== null && d < 0;
  }

  shareJob(job: JobOffer): void {
    const url = `${window.location.origin}/dashboard/jobs/${job.id}`;
    navigator.clipboard?.writeText(url);
    this.share.emit(job);
  }
}
