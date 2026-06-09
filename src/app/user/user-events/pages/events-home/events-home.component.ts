import { Component, OnInit } from '@angular/core';

import { UserEvent } from '../../models/user-event.model';
import { UserEventsService } from '../../services/user-events.service';

@Component({
  selector: 'app-events-home',
  templateUrl: './events-home.component.html',
  styleUrls: ['./events-home.component.css']
})
export class EventsHomeComponent implements OnInit {

  events: UserEvent[] = [];
  loading = false;
  error: string | null = null;
  search = '';
  selectedType = '';

  constructor(private eventsService: UserEventsService) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents(): void {
    this.loading = true;

    this.eventsService.getEvents().subscribe({
      next: (response) => {
        this.events = response;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load events.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.loading = true;
    this.eventsService.getEvents({ search: this.search, type: this.selectedType }).subscribe({
      next: (response) => {
        this.events = response;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load events.';
        this.loading = false;
      }
    });
  }

  get eventTypes(): string[] {
    return [...new Set(this.events.map(event => event.type).filter((type): type is string => !!type))].sort();
  }
}
