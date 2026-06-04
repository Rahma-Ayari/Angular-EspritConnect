import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserEvent, EventApprovalStatus } from '../../models/user-event.model';
import { UserEventsService } from '../../services/user-events.service';

@Component({
  selector: 'app-my-event-details',
  templateUrl: './my-event-details.component.html',
  styleUrls: ['./my-event-details.component.css']
})
export class MyEventDetailsComponent implements OnInit {
  event?: UserEvent;
  loading = false;
  error: string | null = null;

  sidebarOpen = true;
  activeNav = 'events';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventsService: UserEventsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadEvent(id);
    } else {
      this.error = 'Invalid event id.';
    }
  }

  loadEvent(id: number): void {
    this.loading = true;
    this.error = null;
    this.eventsService.getMyCreatedEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load event:', err);
        this.error = 'Unable to load event details.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/events/mine']);
  }

  editEvent(): void {
    if (this.event?.idEvenement) {
      this.router.navigate(['/events/edit', this.event.idEvenement]);
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