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
    if (this.event.unlimitedParticipants) {
      return `${this.event.nombreParticipants || 0} / Unlimited`;
    }
    return `${this.event.nombreParticipants || 0} / ${this.event.capacite || 0}`;
  }

  onImageError(): void {
    this.imageFailed = true;
  }
}
