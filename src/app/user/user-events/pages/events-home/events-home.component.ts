import { Component, OnInit } from '@angular/core';

import { UserEvent } from '../../models/user-event.model';
import { UserEventsService } from '../../services/user-events.service';

interface CategorySuggestion {
  category: string;
  interestedUsers: number;
  matches: EventMatch[];
}

interface EventMatch {
  idEvenement: number;
  titre: string;
  status: string | null;
}

@Component({
  selector: 'app-events-home',
  templateUrl: './events-home.component.html',
  styleUrls: ['./events-home.component.css']
})
export class EventsHomeComponent implements OnInit {
  events: UserEvent[] = [];
  suggestions: CategorySuggestion[] = [];
  loading = false;
  actionLoading = false;
  suggestionsLoading = false;
  error: string | null = null;
  search = '';
  selectedType = '';
  showDeleteModal = false;
  eventToDelete: UserEvent | null = null;
  deleteModalError: string | null = null;

  constructor(private eventsService: UserEventsService) {}

  ngOnInit(): void {
    this.fetchEvents();
    this.fetchSuggestions();
  }

  fetchEvents(): void {
    this.loading = true;

    this.eventsService.getEvents().subscribe({
      next: (response) => {
        this.events = response.filter(event => event.status !== 'COMPLETED');
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load events.';
        this.loading = false;
      }
    });
  }

  fetchSuggestions(): void {
    this.suggestionsLoading = true;
    this.eventsService.getSuggestions().subscribe({
      next: (data) => {
        this.suggestions = data.suggestions || [];
        this.suggestionsLoading = false;
      },
      error: () => {
        this.suggestionsLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.loading = true;
    this.eventsService.getEvents({ search: this.search, type: this.selectedType }).subscribe({
      next: (response) => {
        this.events = response.filter(event => event.status !== 'COMPLETED');
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load events.';
        this.loading = false;
      }
    });
  }

  onDeleteEvent(event: UserEvent): void {
    this.eventToDelete = event;
    this.showDeleteModal = true;
    this.deleteModalError = null;
  }

  closeDeleteModal(): void {
    if (this.actionLoading) return;
    this.showDeleteModal = false;
    this.eventToDelete = null;
    this.deleteModalError = null;
  }

  confirmDelete(): void {
    if (!this.eventToDelete?.idEvenement) return;
    this.actionLoading = true;
    this.deleteModalError = null;
    this.eventsService.deleteEvent(this.eventToDelete.idEvenement).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.idEvenement !== this.eventToDelete?.idEvenement);
        this.showDeleteModal = false;
        this.eventToDelete = null;
        this.actionLoading = false;
        this.deleteModalError = null;
      },
      error: (err) => {
        this.deleteModalError = err?.error?.error || 'Unable to delete this event.';
        this.actionLoading = false;
      }
    });
  }

  get eventTypes(): string[] {
    return [...new Set(this.events.map(event => event.type).filter((type): type is string => !!type))].sort();
  }

  navigateToEvent(id: number): void {
    window.open(`/events/${id}`, '_blank');
  }
}
