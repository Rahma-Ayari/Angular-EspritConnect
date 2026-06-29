import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { JobOffer, CONTRACT_TYPE_LABELS, WORK_MODE_LABELS } from '../../../jobs/models/job.model';
import { MatchBreakdown } from '../../models/student-job.model';

@Component({
  selector: 'app-student-job-card',
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.css']
})
export class StudentJobCardComponent {
  @Input() job!: JobOffer;
  @Input() match?: MatchBreakdown;
  @Input() saved = false;
  @Input() showMatch = true;

  @Output() saveToggle = new EventEmitter<void>();
  @Output() share = new EventEmitter<void>();

  readonly contractLabels = CONTRACT_TYPE_LABELS;
  readonly workModeLabels = WORK_MODE_LABELS;

  constructor(private router: Router) {}

  get initials(): string {
    const name = this.job.companyName || this.job.title || 'J';
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }

  get postedLabel(): string {
    if (!this.job.createdAt) return 'Recently posted';
    const days = Math.floor(
      (Date.now() - new Date(this.job.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days <= 0) return 'Posted today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  }

  get deadlineLabel(): string {
    if (!this.job.deadline) return '';
    const d = new Date(this.job.deadline);
    const daysLeft = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return 'Expired';
    if (daysLeft === 0) return 'Closes today';
    if (daysLeft <= 7) return `Closes in ${daysLeft}d`;
    return `Deadline: ${d.toLocaleDateString()}`;
  }

  get isClosingSoon(): boolean {
    if (!this.job.deadline) return false;
    const daysLeft = Math.ceil((new Date(this.job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= 7;
  }

  get salaryLabel(): string {
    if (this.job.salaryMin && this.job.salaryMax) {
      return `${this.job.salaryMin}-${this.job.salaryMax} TND`;
    }
    if (this.job.salaryMin) return `From ${this.job.salaryMin} TND`;
    return '';
  }

  openDetails(): void {
    if (this.job.id) {
      this.router.navigate(['/dashboard/jobs', this.job.id]);
    }
  }

  onSave(e: Event): void {
    e.stopPropagation();
    this.saveToggle.emit();
  }

  onShare(e: Event): void {
    e.stopPropagation();
    this.share.emit();
  }
}
