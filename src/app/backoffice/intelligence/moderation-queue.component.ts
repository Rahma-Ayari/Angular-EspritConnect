import { Component, OnInit } from '@angular/core';
import { ModerationService } from '../../services/moderation.service';
import { ModerationReport, ModerationReviewRequest, ModerationStatus } from '../../models/moderation.model';

@Component({
  selector: 'app-moderation-queue',
  templateUrl: './moderation-queue.component.html',
  styleUrls: ['./moderation-queue.component.css']
})
export class ModerationQueueComponent implements OnInit {
  reports: ModerationReport[] = [];
  filter: ModerationStatus | 'ALL' = 'PENDING';
  selected: ModerationReport | null = null;
  reviewNotes = '';
  reviewStatus: ModerationStatus = 'RESOLVED';
  reviewAction: ModerationReviewRequest['actionTaken'] = 'WARN_USER';

  constructor(private moderationService: ModerationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    if (this.filter === 'ALL') {
      this.moderationService.getAllReports().subscribe(r => this.reports = r);
    } else {
      this.moderationService.getByStatus(this.filter).subscribe(r => this.reports = r);
    }
  }

  selectReport(r: ModerationReport): void {
    this.selected = r;
    this.reviewNotes = r.moderatorNotes || '';
  }

  submitReview(): void {
    if (!this.selected) return;
    const body: ModerationReviewRequest = {
      status: this.reviewStatus,
      actionTaken: this.reviewAction,
      moderatorNotes: this.reviewNotes
    };
    this.moderationService.reviewReport(this.selected.id, body).subscribe({
      next: () => {
        this.selected = null;
        this.load();
      }
    });
  }
}
