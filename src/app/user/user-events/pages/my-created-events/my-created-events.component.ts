import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserEvent } from '../../models/user-event.model';
import { UserEventsService } from '../../services/user-events.service';

@Component({
  selector: 'app-my-created-events',
  templateUrl: './my-created-events.component.html',
  styleUrls: ['./my-created-events.component.css']
})
export class MyCreatedEventsComponent implements OnInit {
  events: UserEvent[] = [];
  loading = false;
  error: string | null = null;

  sidebarOpen = true;
  activeNav = 'events';

  constructor(private eventsService: UserEventsService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.eventsService.getMyCreatedEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load created events:', err);
        this.error = 'Unable to load your created events.';
        this.loading = false;
      }
    });
  }

  edit(event: UserEvent): void {
    if (event.idEvenement) this.router.navigate(['/events/edit', event.idEvenement]);
  }

  delete(event: UserEvent): void {
    if (!event.idEvenement) return;
    const confirmed = typeof window !== 'undefined' && window.confirm(`Delete "${event.titre}"?`);
    if (!confirmed) return;
    this.eventsService.deleteEvent(event.idEvenement).subscribe({
      next: () => this.load(),
      error: (err) => this.error = err?.error?.error || 'Unable to delete event.'
    });
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