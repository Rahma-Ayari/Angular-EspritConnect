import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Event, EventApprovalStatus } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-approvals',
  templateUrl: './event-approvals.component.html',
  styleUrls: ['./event-approvals.component.css']
})
export class EventApprovalsComponent implements OnInit {
  events: Event[] = [];
  loading = false;
  error: string | null = null;
  selectedFilter: EventApprovalStatus | 'ALL' = 'ALL';
  readonly filters: Array<{ label: string; value: EventApprovalStatus | 'ALL' }> = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = null;

    const obs = this.selectedFilter === 'ALL'
      ? this.eventService.getAllEvents()
      : this.eventService.getEventsByApprovalStatus(this.selectedFilter);

    obs.subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load events:', err);
        this.error = 'Unable to load events.';
        this.loading = false;
      }
    });
  }

  setFilter(value: EventApprovalStatus | 'ALL'): void {
    this.selectedFilter = value;
    this.loadEvents();
  }

  viewEvent(event: Event): void {
    if (event.idEvenement) {
      this.router.navigate(['/admin/events', event.idEvenement]);
    }
  }

  approveEvent(event: Event): void {
    if (!event.idEvenement) return;
    this.eventService.approveEvent(event.idEvenement).subscribe({
      next: () => this.loadEvents(),
      error: () => this.error = 'Unable to approve event.'
    });
  }

  rejectEvent(event: Event): void {
    if (!event.idEvenement) return;
    const reason = prompt('Enter rejection reason (optional):', '');
    if (reason !== null) {
      this.eventService.rejectEvent(event.idEvenement, reason).subscribe({
        next: () => this.loadEvents(),
        error: () => this.error = 'Unable to reject event.'
      });
    }
  }

  getApprovalBadgeClass(status: EventApprovalStatus | null | undefined): string {
    const classes: Record<string, string> = {
      PENDING: 'badge-pending',
      APPROVED: 'badge-approved',
      REJECTED: 'badge-rejected'
    };
    return classes[status || ''] || '';
  }
}