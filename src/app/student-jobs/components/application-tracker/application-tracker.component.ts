import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  APPLICATION_STATUS_LABELS,
  ApplicationUiStatus,
  JobApplication,
  KanbanCard,
  KANBAN_COLUMNS
} from '../../models/student-job.model';

const COLUMN_COLORS: Record<ApplicationUiStatus, string> = {
  SAVED: '#6366f1',
  APPLIED: '#3b82f6',
  UNDER_REVIEW: '#f59e0b',
  INTERVIEW: '#8b5cf6',
  TECHNICAL_TEST: '#06b6d4',
  ACCEPTED: '#16a34a',
  REJECTED: '#9ca3af'
};

@Component({
  selector: 'app-application-tracker',
  templateUrl: './application-tracker.component.html',
  styleUrls: ['./application-tracker.component.css']
})
export class ApplicationTrackerComponent {
  @Input() applications: JobApplication[] = [];
  @Input() kanbanCards: KanbanCard[] = [];
  @Input() view: 'table' | 'kanban' = 'kanban';
  @Output() openJob = new EventEmitter<number>();

  readonly statusLabels = APPLICATION_STATUS_LABELS;
  readonly columns = KANBAN_COLUMNS;

  byStatus(status: ApplicationUiStatus): KanbanCard[] {
    return this.kanbanCards.filter((c) => c.uiStatus === status);
  }

  columnColor(status: ApplicationUiStatus): string {
    return COLUMN_COLORS[status] || '#9ca3af';
  }

  initials(name: string): string {
    return (name || 'J').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }
}
