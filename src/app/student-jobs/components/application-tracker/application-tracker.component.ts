import { Component, Input } from '@angular/core';
import {
  APPLICATION_STATUS_LABELS,
  ApplicationUiStatus,
  JobApplication
} from '../../models/student-job.model';

@Component({
  selector: 'app-application-tracker',
  templateUrl: './application-tracker.component.html',
  styleUrls: ['./application-tracker.component.css']
})
export class ApplicationTrackerComponent {
  @Input() applications: JobApplication[] = [];
  @Input() view: 'table' | 'kanban' = 'table';

  readonly statusLabels = APPLICATION_STATUS_LABELS;
  readonly columns: ApplicationUiStatus[] = [
    'APPLIED',
    'UNDER_REVIEW',
    'INTERVIEW',
    'TECHNICAL_TEST',
    'ACCEPTED',
    'REJECTED'
  ];

  byStatus(status: ApplicationUiStatus): JobApplication[] {
    return this.applications.filter((a) => a.uiStatus === status);
  }
}
