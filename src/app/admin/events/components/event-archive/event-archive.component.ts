import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { ArchiveEvent, Event, WaitingListEntry } from '../../models/event.model';

@Component({
  selector: 'app-event-archive',
  standalone: false,
  templateUrl: './event-archive.component.html',
  styleUrls: ['./event-archive.component.css']
})
export class EventArchiveComponent implements OnInit {
  @Input() events: Event[] = [];
  @Output() viewEvent = new EventEmitter<Event>();
  @Output() editEvent = new EventEmitter<Event>();
  @Output() deleteEvent = new EventEmitter<Event>();

  archiveEvents: ArchiveEvent[] = [];
  isLoading = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadArchive();
  }

  loadArchive(): void {
    this.isLoading = true;
    this.eventService.getArchivedEvents().subscribe({
      next: (events) => {
        this.archiveEvents = events;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onView(event: ArchiveEvent): void {
    this.viewEvent.emit(event as unknown as Event);
  }

  onEdit(event: ArchiveEvent): void {
    this.editEvent.emit(event as unknown as Event);
  }

  onDelete(event: ArchiveEvent): void {
    this.deleteEvent.emit(event as unknown as Event);
  }

  trackEvent(index: number, event: ArchiveEvent): number {
    return event.idEvenement ?? index;
  }
}
