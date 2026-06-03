import { Component, OnInit } from '@angular/core';
import { UserParticipation } from '../../models/user-event.model';
import { UserEventsService } from '../../services/user-events.service';

@Component({
  selector: 'app-my-participations',
  templateUrl: './my-participations.component.html',
  styleUrls: ['./my-participations.component.css']
})
export class MyParticipationsComponent implements OnInit {
  participations: UserParticipation[] = [];
  loading = false;
  error: string | null = null;

  constructor(private eventsService: UserEventsService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.eventsService.getMyParticipations().subscribe({
      next: (items) => {
        this.participations = items;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load participations:', err);
        this.error = 'Unable to load your participations.';
        this.loading = false;
      }
    });
  }

  cancel(eventId?: number): void {
    if (!eventId) return;
    this.eventsService.cancelParticipation(eventId).subscribe({
      next: () => this.load(),
      error: (err) => this.error = err?.error?.error || 'Unable to cancel participation.'
    });
  }
}
