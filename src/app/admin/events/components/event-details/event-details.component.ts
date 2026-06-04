import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Event, EventApprovalStatus } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit {
  event: Event | null = null;
  isLoading = false;
  error: string | null = null;
  imageFailed = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error = 'Invalid event id.';
      return;
    }

    this.loadEvent(id);
  }

  editEvent(): void {
    if (!this.event?.idEvenement) return;
    this.router.navigate(['/admin/events/edit', this.event.idEvenement]);
  }

  backToEvents(): void {
    this.router.navigate(['/admin/events']);
  }

  openUserView(): void {
    this.router.navigate(['/events', this.event?.idEvenement]);
  }

  onImageError(): void {
    this.imageFailed = true;
  }

  get hasImage(): boolean {
    return !!this.event?.imageUrl && !this.imageFailed;
  }

  get statusClass(): string {
    return (this.event?.status || 'UPCOMING').toLowerCase();
  }

  get approvalStatusClass(): string {
    const status = this.event?.approvalStatus as EventApprovalStatus;
    if (!status) return '';
    return `approval-${status.toLowerCase()}`;
  }

  approveEvent(): void {
    if (!this.event?.idEvenement) return;
    this.eventService.approveEvent(this.event.idEvenement).subscribe({
      next: () => this.loadEvent(this.event!.idEvenement!),
      error: (err) => this.error = 'Unable to approve event.'
    });
  }

  rejectEvent(): void {
    if (!this.event?.idEvenement) return;
    const reason = prompt('Enter rejection reason:', '');
    if (reason !== null) {
      this.eventService.rejectEvent(this.event.idEvenement, reason).subscribe({
        next: () => this.loadEvent(this.event!.idEvenement!),
        error: (err) => this.error = 'Unable to reject event.'
      });
    }
  }

  private loadEvent(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load event:', err);
        this.error = 'Unable to load event details.';
        this.isLoading = false;
      }
    });
  }
}
