import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserEvent, EventApprovalStatus } from '../../models/user-event.model';
import { UserEventsService } from '../../services/user-events.service';

@Component({
  selector: 'app-event-details-page',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {

  event?: UserEvent;
  loading = false;
  actionLoading = false;
  error: string | null = null;

  sidebarOpen = true;
  activeNav = 'events';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private eventsService: UserEventsService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.loading = true;
    this.eventsService.getEventById(id).subscribe({
      next: (response) => {
        this.event = response;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load event:', err);
        this.error = 'Unable to load event.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  participate(): void {
    if (!this.event?.idEvenement) return;
    this.actionLoading = true;
    this.eventsService.participate(this.event.idEvenement).subscribe({
      next: () => this.refresh(),
      error: (err) => {
        this.error = err?.error?.error || 'Unable to participate.';
        this.actionLoading = false;
      }
    });
  }

  cancelParticipation(): void {
    if (!this.event?.idEvenement) return;
    this.actionLoading = true;
    this.eventsService.cancelParticipation(this.event.idEvenement).subscribe({
      next: () => this.refresh(),
      error: (err) => {
        this.error = err?.error?.error || 'Unable to cancel participation.';
        this.actionLoading = false;
      }
    });
  }

  private refresh(): void {
    if (!this.event?.idEvenement) return;
    this.eventsService.getEventById(this.event.idEvenement).subscribe({
      next: (event) => {
        this.event = event;
        this.actionLoading = false;
      },
      error: () => this.actionLoading = false
    });
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