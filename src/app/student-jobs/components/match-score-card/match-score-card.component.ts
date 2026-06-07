import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatchBreakdown } from '../../models/student-job.model';

@Component({
  selector: 'app-match-score-card',
  templateUrl: './match-score-card.component.html',
  styleUrls: ['./match-score-card.component.css']
})
export class MatchScoreCardComponent {
  @Input() match!: MatchBreakdown;
  @Input() applying = false;
  @Input() saved = false;

  @Output() apply = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() share = new EventEmitter<void>();
}
