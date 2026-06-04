import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  sidebarOpen = true;
  activeNav = 'events';

  constructor(
    private eventsService: UserEventsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchEvents();
  }

  fetchEvents(): void {
    this.loading = true;

    this.eventsService.getEvents().subscribe({
      next: (response) => {
        this.events = response.filter(e => e.approvalStatus === 'APPROVED' || !e.approvalStatus);
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
        this.events = response.filter(e => e.approvalStatus === 'APPROVED' || !e.approvalStatus);
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

  setNav(navId: string): void {
    this.activeNav = navId;
    const routes: { [key: string]: string } = {
      dashboard: '/dashboard',
      profile: '/profile',
      opportunities: '/opportunities',
      events: '/events',
      messages: '/messages',
      settings: '/settings'
    };
    if (routes[navId]) {
      this.router.navigate([routes[navId]]);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
