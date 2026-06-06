import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Event } from '../../models/event.model';
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
    this.router.navigate(['/events']);
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
