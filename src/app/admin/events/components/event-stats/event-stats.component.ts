import { Component, Input } from '@angular/core';
import { EventStats } from '../../models/event.model';

@Component({
  selector: 'app-event-stats',
  templateUrl: './event-stats.component.html',
  styleUrls: ['./event-stats.component.css']
})
export class EventStatsComponent {
  @Input() stats: EventStats | null = null;

  get totalEvents(): number {
    return this.stats?.totalEvents ?? 0;
  }

  get activeEvents(): number {
    return this.stats?.activeEvents ?? 0;
  }

  get upcomingEvents(): number {
    return this.stats?.upcomingEvents ?? 0;
  }

  get totalCapacity(): number {
    return this.stats?.totalCapacity ?? 0;
  }

  get cancelledEvents(): number {
    return this.stats?.cancelledEvents ?? 0;
  }

  get completedEvents(): number {
    return this.stats?.completedEvents ?? 0;
  }

  get totalParticipants(): number {
    return this.stats?.totalParticipants ?? 0;
  }

  get participationRate(): number {
    return this.stats?.participationRate ?? 0;
  }
}
