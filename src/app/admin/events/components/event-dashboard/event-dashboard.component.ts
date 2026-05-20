import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-dashboard',
  templateUrl: './event-dashboard.component.html',
  styleUrls: ['./event-dashboard.component.css']
})
export class EventDashboardComponent implements OnInit {

  events: Event[] = [];

  totalCapacity = 0;

  activeEvents = 0;

  totalEvents = 0;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {

    this.loadEvents();

    this.loadStats();
  }

  loadEvents(): void {

    this.eventService.getAllEvents().subscribe({
      next: (data) => {
        this.events = data;

        this.totalCapacity = data.reduce(
          (sum, e) => sum + e.capacite,
          0
        );

        this.activeEvents = data.filter(
          e => e.status === 'ACTIVE'
        ).length;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  loadStats(): void {

    this.eventService.getTotalEvents().subscribe({
      next: (data) => {
        this.totalEvents = data;
      }
    });
  }

  deleteEvent(id: number): void {

    this.eventService.deleteEvent(id).subscribe(() => {
      this.loadEvents();
      this.loadStats();
    });
  }
}
