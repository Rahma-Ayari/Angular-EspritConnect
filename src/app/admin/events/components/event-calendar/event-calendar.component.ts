import { Component, Input } from '@angular/core';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-calendar',
  templateUrl: './event-calendar.component.html',
  styleUrls: ['./event-calendar.component.css']
})
export class EventCalendarComponent {

  @Input() events: Event[] = [];
}
