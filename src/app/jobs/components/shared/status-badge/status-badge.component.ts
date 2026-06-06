import { Component, Input } from '@angular/core';
import { JobStatus, JOB_STATUS_COLORS } from '../../../models/job.model';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.css']
})
export class StatusBadgeComponent {
  @Input() status!: JobStatus;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  get label(): string {
    return (this.status || '').toLowerCase();
  }

  get color(): string {
    return JOB_STATUS_COLORS[this.status] || '#6b7280';
  }
}
