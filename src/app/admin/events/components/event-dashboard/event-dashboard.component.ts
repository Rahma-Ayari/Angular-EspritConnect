import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event, EventStats } from '../../models/event.model';

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

  readonly statuses = ['ACTIVE', 'UPCOMING', 'CANCELLED', 'COMPLETED'];

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
  }

  loadEvents(): void {
    this.isLoading = true;
    this.error = null;

    this.eventService.getAllEvents({
      search: this.searchQuery,
      status: this.selectedStatus,
      type: this.selectedType
    }).subscribe({
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
    this.loadEvents();
  }

  createEvent(): void {
    this.router.navigate(['/admin/events/create']);
  }

  openUserView(): void {
    this.router.navigate(['/events']);
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

  get eventTypes(): string[] {
    return [...new Set(this.events.map(event => event.type).filter((type): type is string => !!type))].sort();
  }
}
