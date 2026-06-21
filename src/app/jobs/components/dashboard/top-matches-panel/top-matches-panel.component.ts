import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TopMatchCandidate } from '../../../ai/models/ai.model';

@Component({
  selector: 'app-top-matches-panel',
  templateUrl: './top-matches-panel.component.html',
  styleUrls: ['./top-matches-panel.component.css']
})
export class TopMatchesPanelComponent implements OnChanges {
  @Input() candidates: TopMatchCandidate[] = [];
  @Input() loading = false;
  @Input() selectedOffreId: number | null = null;

  @Output() candidateSelected = new EventEmitter<TopMatchCandidate>();

  displayCandidates: TopMatchCandidate[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['candidates']) {
      this.displayCandidates = [...this.candidates]
        .sort((a, b) => (b.aiScore ?? b.scoreCompatibilite) - (a.aiScore ?? a.scoreCompatibilite))
        .slice(0, 5);
    }
  }

  scoreFor(candidate: TopMatchCandidate): number {
    return Math.round(candidate.aiScore ?? candidate.scoreCompatibilite ?? 0);
  }

  selectCandidate(candidate: TopMatchCandidate): void {
    this.candidateSelected.emit(candidate);
  }
}
