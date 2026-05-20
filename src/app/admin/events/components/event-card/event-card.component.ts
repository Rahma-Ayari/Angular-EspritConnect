import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.css']
})
export class EventCardComponent {
  @Input({ required: true }) event!: Event;

  @Output() viewEvent = new EventEmitter<Event>();
  @Output() editEvent = new EventEmitter<Event>();
  @Output() deleteEvent = new EventEmitter<Event>();

  imageFailed = false;

  get hasImage(): boolean {
    return !!this.event.imageUrl && !this.imageFailed;
  }

  get statusClass(): string {
    return (this.event.status || 'UPCOMING').toLowerCase();
  }

  get capacityLabel(): string {
    return `${this.event.capacite || 0} seats`;
  }

  onImageError(): void {
    this.imageFailed = true;
  }
}
