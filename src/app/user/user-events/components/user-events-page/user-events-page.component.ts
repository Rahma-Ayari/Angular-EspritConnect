import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

import { UserEvent } from '../../models/user-event.model';
import { UserEventsService } from '../../services/user-events.service';

@Component({
  selector: 'app-user-events-page',
  templateUrl: './user-events-page.component.html',
  styleUrls: ['./user-events-page.component.css']
})
export class UserEventsPageComponent implements OnInit {
  events: UserEvent[] = [];
  isLoading = false;
  error: string | null = null;
  searchQuery = '';
  selectedType = '';
  imageFailures = new Set<number>();
  private readonly isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private userEventsService: UserEventsService,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.loadEvents();
    }
  }

  loadEvents(): void {
    this.isLoading = true;
    this.error = null;

    this.userEventsService.getEvents({
      search: this.searchQuery,
      type: this.selectedType
    }).subscribe({
      next: (events) => {
        this.events = events;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load public events:', err);
        this.error = 'Unable to load events.';
        this.isLoading = false;
      }
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedType = '';
    this.loadEvents();
  }

  openDetails(event: UserEvent): void {
    if (!event.idEvenement) return;
    this.router.navigate(['/events', event.idEvenement]);
  }

  markImageFailed(event: UserEvent): void {
    if (event.idEvenement) {
      this.imageFailures.add(event.idEvenement);
    }
  }

  hasImage(event: UserEvent): boolean {
    return !!event.imageUrl && !this.imageFailures.has(event.idEvenement || 0);
  }

  get eventTypes(): string[] {
    return [...new Set(this.events.map(event => event.type).filter((type): type is string => !!type))].sort();
  }

  get featuredEvent(): UserEvent | null {
    return this.events[0] || null;
  }
}
