import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event, EventApprovalStatus } from '../../models/event.model';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  pendingEventsOnly = false;
  selectedApprovalStatus: EventApprovalStatus | null = null;

  constructor(
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    const obs = this.pendingEventsOnly && this.selectedApprovalStatus === 'PENDING'
      ? this.eventService.getPendingEvents()
      : this.selectedApprovalStatus
        ? this.eventService.getEventsByApprovalStatus(this.selectedApprovalStatus)
        : this.eventService.getAllEvents();

    obs.subscribe({
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

  approveEvent(event: Event) {
    if (!event.idEvenement) return;
    this.eventService.approveEvent(event.idEvenement).subscribe(() => {
      this.loadEvents();
    });
  }

  rejectEvent(event: Event) {
    if (!event.idEvenement) return;
    const reason = prompt('Enter rejection reason:', '');
    if (reason !== null) {
      this.eventService.rejectEvent(event.idEvenement, reason).subscribe(() => {
        this.loadEvents();
      });
    }
  }

  filterPending() {
    this.pendingEventsOnly = true;
    this.selectedApprovalStatus = 'PENDING';
    this.loadEvents();
  }

  filterByStatus(status: EventApprovalStatus | null) {
    this.selectedApprovalStatus = status;
    this.loadEvents();
  }

  viewEvent(event: Event) {
    if (event.idEvenement) {
      this.router.navigate(['/admin/events', event.idEvenement]);
    }
  }

  editEvent(event: Event) {
    if (event.idEvenement) {
      this.router.navigate(['/admin/events/edit', event.idEvenement]);
    }
  }
}
