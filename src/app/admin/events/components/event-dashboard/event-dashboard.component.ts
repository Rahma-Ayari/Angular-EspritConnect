import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event, EventStats, EventApprovalStatus } from '../../models/event.model';

@Component({
  selector: 'app-event-dashboard',
  templateUrl: './event-dashboard.component.html',
  styleUrls: ['./event-dashboard.component.css']
})
export class EventDashboardComponent implements OnInit {
  events: Event[] = [];
  stats: EventStats | null = null;
  isLoading = false;
  error: string | null = null;
  searchQuery = '';
  selectedStatus = '';
  selectedType = '';
  selectedApprovalStatus: EventApprovalStatus | null = null;
  eventTypes: string[] = [];

  readonly statuses = ['ACTIVE', 'UPCOMING', 'CANCELLED', 'COMPLETED'];
  readonly approvalStatuses: EventApprovalStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loadEvents();
    this.loadStats();
    this.loadEventTypes();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.error = null;

    const filters: any = {
      search: this.searchQuery,
      status: this.selectedStatus,
      type: this.selectedType
    };
    
    const obs = this.selectedApprovalStatus
      ? this.eventService.getEventsByApprovalStatus(this.selectedApprovalStatus)
      : this.eventService.getAllEvents(filters);

    obs.subscribe({
      next: (events) => {
        this.events = events;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load events:', err);
        this.error = 'Unable to load events.';
        this.isLoading = false;
      }
    });
  }

  loadStats(): void {
    this.eventService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (err) => {
        console.error('Failed to load event stats:', err);
      }
    });
  }

  applyFilters(): void {
    this.loadEvents();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedType = '';
    this.selectedApprovalStatus = null;
    this.loadEvents();
  }

  filterByApproval(status: EventApprovalStatus | null) {
    this.selectedApprovalStatus = status;
    this.loadEvents();
  }

  createEvent(): void {
    this.router.navigate(['/admin/events/create']);
  }

  manageTypes(): void {
    this.router.navigate(['/admin/events/types']);
  }

  openUserView(): void {
    this.router.navigate(['/events']);
  }

  manageUserEvents(): void {
    this.router.navigate(['/admin/events/approvals']);
  }

  viewEvent(event: Event): void {
    if (!event.idEvenement) return;
    this.router.navigate(['/admin/events', event.idEvenement]);
  }

  editEvent(event: Event): void {
    if (!event.idEvenement) return;
    this.router.navigate(['/admin/events/edit', event.idEvenement]);
  }

  deleteEvent(event: Event): void {
    if (!event.idEvenement) return;

    const canDelete = typeof window === 'undefined'
      ? true
      : window.confirm(`Delete "${event.titre}"? This action cannot be undone.`);

    if (!canDelete) return;

    this.eventService.deleteEvent(event.idEvenement).subscribe({
      next: () => {
        this.loadDashboard();
      },
      error: (err) => {
        console.error('Failed to delete event:', err);
        this.error = 'Unable to delete this event.';
      }
    });
  }

  approveEvent(event: Event): void {
    if (!event.idEvenement) return;
    this.eventService.approveEvent(event.idEvenement).subscribe({
      next: () => this.loadDashboard(),
      error: (err) => this.error = 'Unable to approve event.'
    });
  }

  rejectEvent(event: Event): void {
    if (!event.idEvenement) return;
    const reason = prompt('Enter rejection reason:', '');
    if (reason !== null) {
      this.eventService.rejectEvent(event.idEvenement, reason).subscribe({
        next: () => this.loadDashboard(),
        error: (err) => this.error = 'Unable to reject event.'
      });
    }
  }

  loadEventTypes(): void {
    this.eventService.getEventTypes(true).subscribe({
      next: (types) => {
        this.eventTypes = types.map(type => type.nom);
      },
      error: (err) => console.error('Failed to load event types:', err)
    });
  }
}
