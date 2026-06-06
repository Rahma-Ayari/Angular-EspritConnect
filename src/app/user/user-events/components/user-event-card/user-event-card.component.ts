import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

import { UserEvent } from '../../models/user-event.model';

@Component({
  selector: 'app-user-event-card',
  templateUrl: './user-event-card.component.html',
  styleUrls: ['./user-event-card.component.css']
})
export class UserEventCardComponent {

  @Input() event!: UserEvent;

  @Output() view = new EventEmitter<number>();

  constructor(private router: Router) {}

  openDetails(): void {
    if (!this.event.idEvenement) {
      return;
    }

    this.router.navigate(['/events', this.event.idEvenement]);
  }
}
