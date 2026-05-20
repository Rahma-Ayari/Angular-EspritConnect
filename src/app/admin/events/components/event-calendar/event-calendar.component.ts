import { Component, Input } from '@angular/core';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-calendar',
  templateUrl: './event-calendar.component.html',
  styleUrls: ['./event-calendar.component.css']
})
export class EventCalendarComponent {
  @Input() events: Event[] = [];

  get upcomingEvents(): Event[] {
    const now = new Date().getTime();

    return this.events
      .filter(event => new Date(event.dateEvenement).getTime() >= now)
      .sort((left, right) => new Date(left.dateEvenement).getTime() - new Date(right.dateEvenement).getTime())
      .slice(0, 6);
  }
}
