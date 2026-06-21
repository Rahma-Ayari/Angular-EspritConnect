import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { EventService } from '../../services/event.service';
import { Event as AppEvent, WaitingListEntry } from '../../models/event.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-waiting-list',
  standalone: false,
  templateUrl: './event-waiting-list.component.html',
  styleUrls: ['./event-waiting-list.component.css']
})
export class EventWaitingListComponent implements OnInit {
  @Input() event: AppEvent | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  entries: WaitingListEntry[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    if (this.event?.idEvenement) {
      this.loadWaitingList();
    }
  }

  loadWaitingList(): void {
    if (!this.event?.idEvenement) return;
    this.isLoading = true;
    this.error = null;
    this.eventService.getWaitingList(this.event.idEvenement).subscribe({
      next: (entries) => {
        this.entries = entries;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Unable to load waiting list.';
        this.isLoading = false;
      }
    });
  }

  accept(entry: WaitingListEntry): void {
    if (!entry.idListeAttente) return;
    this.eventService.acceptWaitingListUser(entry.idListeAttente).subscribe({
      next: () => {
        this.updated.emit();
        this.loadWaitingList();
      },
      error: () => {
        this.error = 'Unable to accept user.';
      }
    });
  }

  reject(entry: WaitingListEntry): void {
    if (!entry.idListeAttente) return;
    const confirmed = typeof window === 'undefined'
      ? true
      : window.confirm(`Reject ${entry.userNom || 'this user'} from the waiting list?`);
    if (!confirmed) return;

    this.eventService.rejectWaitingListUser(entry.idListeAttente).subscribe({
      next: () => {
        this.updated.emit();
        this.loadWaitingList();
      },
      error: () => {
        this.error = 'Unable to reject user.';
      }
    });
  }

  close(): void {
    this.closed.emit();
  }
}
