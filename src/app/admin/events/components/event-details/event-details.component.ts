import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Event, EventParticipation } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnChanges {
  @Input() modalMode = false;
  @Input() event: Event | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() edited = new EventEmitter<Event>();
  @Output() deleted = new EventEmitter<Event>();

  isLoading = false;
  error: string | null = null;
  imageFailed = false;
  participations: EventParticipation[] = [];
  participationsModalOpen = false;
  participationsLoading = false;
  participationsError: string | null = null;

  waitingListOpen = false;
  waitingListCount = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'] && !this.modalMode) {
      this.imageFailed = false;
      this.participations = [];
      this.participationsError = null;
    }
  }

  ngOnInit(): void {
    if (this.modalMode) return;

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error = 'Invalid event id.';
      return;
    }

    this.loadEvent(id);
  }

  editEvent(): void {
    if (!this.event) return;
    if (this.modalMode) {
      this.edited.emit(this.event);
      return;
    }
    if (!this.event.idEvenement) return;
    this.router.navigate(['/admin/events']);
  }

  backToEvents(): void {
    if (this.modalMode) {
      this.closed.emit();
      return;
    }
    this.router.navigate(['/admin/events']);
  }

  deleteEvent(): void {
    if (!this.event) return;
    if (this.modalMode) {
      this.deleted.emit(this.event);
      return;
    }
    if (!this.event.idEvenement) return;
    this.eventService.deleteEvent(this.event.idEvenement).subscribe({
      next: () => this.router.navigate(['/admin/events']),
      error: (err) => {
        console.error('Failed to delete event:', err);
        this.error = 'Unable to delete this event.';
      }
    });
  }

  openUserView(): void {
    if (!this.event?.idEvenement) return;
    this.router.navigate(['/events', this.event.idEvenement]);
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

  openParticipationsList(): void {
    const eventId = this.event?.idEvenement;
    if (!eventId) return;

    this.participationsModalOpen = true;
    this.participationsLoading = true;
    this.participationsError = null;
    this.eventService.getEventParticipations(eventId).subscribe({
      next: (participations) => {
        this.participations = participations;
        this.participationsLoading = false;
      },
      error: (err) => {
        console.error('Failed to load participations:', err);
        this.participationsError = 'Unable to load participations.';
        this.participationsLoading = false;
      }
    });
  }

  closeParticipationsList(): void {
    this.participationsModalOpen = false;
  }

  openWaitingList(): void {
    this.waitingListOpen = true;
  }

  closeWaitingList(): void {
    this.waitingListOpen = false;
  }

  onWaitingListUpdated(): void {
    if (this.waitingListOpen && this.event?.idEvenement) {
      this.eventService.getWaitingList(this.event.idEvenement).subscribe({
        next: (entries) => {
          this.waitingListCount = entries.length;
        },
        error: () => {}
      });
    }
  }

  approveParticipation(participation: EventParticipation): void {
    if (!participation.idParticipation) return;
    this.eventService.approveParticipation(participation.idParticipation).subscribe({
      next: () => this.openParticipationsList(),
      error: () => {
        this.participationsError = 'Unable to approve participation.';
      }
    });
  }

  rejectParticipation(participation: EventParticipation): void {
    if (!participation.idParticipation) return;
    if (!confirm(`Reject ${participation.userNom || 'this user'}?`)) return;
    this.eventService.rejectParticipation(participation.idParticipation).subscribe({
      next: () => this.openParticipationsList(),
      error: () => {
        this.participationsError = 'Unable to reject participation.';
      }
    });
  }

  get isPendingApproval(): boolean {
    return this.participations.some(p => p.status === 'PENDING_APPROVAL');
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
