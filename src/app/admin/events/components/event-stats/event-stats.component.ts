import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-event-stats',
  templateUrl: './event-stats.component.html',
  styleUrls: ['./event-stats.component.css']
})
export class EventStatsComponent {

  @Input() totalEvents = 0;

  @Input() totalCapacity = 0;

  @Input() activeEvents = 0;
}
