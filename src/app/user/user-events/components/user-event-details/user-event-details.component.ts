import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { UserEvent } from '../../models/user-event.model';
import { UserEventsService } from '../../services/user-events.service';

@Component({
  selector: 'app-user-event-details',
  templateUrl: './user-event-details.component.html',
  styleUrls: ['./user-event-details.component.css']
})
export class UserEventDetailsComponent implements OnInit {
  event: UserEvent | null = null;
  isLoading = false;
  error: string | null = null;
  imageFailed = false;
  private readonly isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private route: ActivatedRoute,
    private router: Router,
    private userEventsService: UserEventsService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error = 'Invalid event id.';
      return;
    }

    this.loadEvent(id);
  }

  backToEvents(): void {
    this.router.navigate(['/events']);
  }

  onImageError(): void {
    this.imageFailed = true;
  }

  get hasImage(): boolean {
    return !!this.event?.imageUrl && !this.imageFailed;
  }

  private loadEvent(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.userEventsService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load public event:', err);
        this.error = 'This event is not available.';
        this.isLoading = false;
      }
    });
  }
}