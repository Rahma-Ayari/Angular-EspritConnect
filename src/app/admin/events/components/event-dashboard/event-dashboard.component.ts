import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Event, EventStatus } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-dashboard',
  templateUrl: './event-dashboard.component.html',
  styleUrls: ['./event-dashboard.component.css']
})
export class EventDashboardComponent implements OnInit {
  events: Event[] = [];
  stats: any = null;
  isLoading = false;
  error: string | null = null;
  searchQuery = '';
  selectedStatus = '';
  selectedType = '';
  eventTypes: string[] = [];
  showCreateModal = false;
  showEventsList = false;
  listSearchQuery = '';
  listSelectedStatus = '';
  listSelectedType = '';
  filteredListEvents: Event[] = [];

  readonly statuses: EventStatus[] = ['ACTIVE', 'UPCOMING', 'CANCELLED', 'COMPLETED'];

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

    this.eventService.getAllEvents(filters).subscribe({
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
    const canDelete = typeof window === 'undefined' ? true : window.confirm(`Delete "${event.titre}"? This action cannot be undone.`);
    if (!canDelete) return;
    this.eventService.deleteEvent(event.idEvenement).subscribe({
      next: () => this.loadDashboard(),
      error: (err) => {
        console.error('Failed to delete event:', err);
        this.error = 'Unable to delete this event.';
      }
    });
  }

  loadEventTypes(): void {
    this.eventService.getEventTypes(true).subscribe({
      next: (types) => {
        this.eventTypes = types.map(type => type.nom);
      },
      error: (err) => console.error('Failed to load event types:', err)
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onEventCreated(): void {
    this.closeCreateModal();
    this.loadDashboard();
  }

  openEventsList(): void {
    this.showEventsList = true;
    this.listSearchQuery = '';
    this.listSelectedStatus = '';
    this.listSelectedType = '';
    this.filteredListEvents = [...this.events];
  }

  filterEventsList(): void {
    let filtered = [...this.events];

    if (this.listSearchQuery) {
      const q = this.listSearchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        (e.titre || '').toLowerCase().includes(q) ||
        (e.lieu || '').toLowerCase().includes(q) ||
        (e.type || '').toLowerCase().includes(q) ||
        (e.entrepriseNom || '').toLowerCase().includes(q)
      );
    }

    if (this.listSelectedStatus) {
      filtered = filtered.filter(e => e.status === this.listSelectedStatus);
    }

    if (this.listSelectedType) {
      filtered = filtered.filter(e => e.type === this.listSelectedType);
    }

    this.filteredListEvents = filtered;
  }

  clearListFilters(): void {
    this.listSearchQuery = '';
    this.listSelectedStatus = '';
    this.listSelectedType = '';
    this.filteredListEvents = [...this.events];
  }

  closeEventsList(): void {
    this.showEventsList = false;
  }
}
