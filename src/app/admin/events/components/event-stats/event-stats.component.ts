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
}
