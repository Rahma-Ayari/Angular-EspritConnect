import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { CategorySuggestion, Event as AppEvent, EventMatch } from '../../models/event.model';

@Component({
  selector: 'app-event-suggestions',
  standalone: false,
  templateUrl: './event-suggestions.component.html',
  styleUrls: ['./event-suggestions.component.css']
})
export class EventSuggestionsComponent implements OnInit {
  @Input() events: AppEvent[] = [];
  @Output()   viewEvent = new EventEmitter<AppEvent>();

  suggestions: CategorySuggestion[] = [];
  isLoading = false;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.isLoading = true;
    this.eventService.getSuggestions().subscribe({
      next: (result) => {
        this.suggestions = result.suggestions;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onViewMatch(match: EventMatch): void {
    this.viewEvent.emit({
      idEvenement: match.idEvenement,
      titre: match.titre,
      status: match.status,
      type: '',
      dateDebut: '',
      dateFin: '',
      lieu: '',
      online: false,
      unlimitedParticipants: false,
      capacite: 0,
      typeEvenementId: 0,
      participated: false,
      ownedByCurrentUser: false
    } as AppEvent);
  }
}
