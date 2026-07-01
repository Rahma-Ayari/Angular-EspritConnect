import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { UserEvent } from '../../models/user-event.model';
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
  showDeleteModal = false;
  deleteModalError: string | null = null;

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

  openDeleteModal(): void {
    this.showDeleteModal = true;
    this.deleteModalError = null;
  }

  closeDeleteModal(): void {
    if (this.actionLoading) return;
    this.showDeleteModal = false;
    this.deleteModalError = null;
  }

  confirmDelete(): void {
    if (!this.event?.idEvenement) return;
    this.actionLoading = true;
    this.deleteModalError = null;
    this.eventsService.deleteEvent(this.event.idEvenement).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.deleteModalError = null;
        this.router.navigate(['/events']);
      },
      error: (err) => {
        this.deleteModalError = err?.error?.error || 'Unable to delete this event.';
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
}
