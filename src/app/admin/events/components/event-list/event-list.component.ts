import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {

  events: Event[] = [];

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getAllEvents().subscribe({
      next: (data: Event[]) => {
        this.events = data;
      }
    });
  }

  deleteEvent(id: number | undefined) {
    if (!id) return;

    this.eventService.deleteEvent(id).subscribe(() => {
      this.loadEvents();
    });
  }
}
