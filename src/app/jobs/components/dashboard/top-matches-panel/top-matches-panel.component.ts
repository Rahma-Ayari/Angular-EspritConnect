import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TopMatchCandidate } from '../../../ai/models/ai.model';

@Component({
  selector: 'app-top-matches-panel',
  templateUrl: './top-matches-panel.component.html',
  styleUrls: ['./top-matches-panel.component.css']
})
export class TopMatchesPanelComponent {
  @Input() candidates: TopMatchCandidate[] = [];
  @Input() loading = false;
  @Input() selectedOffreId: number | null = null;

  @Output() candidateSelected = new EventEmitter<TopMatchCandidate>();

  get displayCandidates(): TopMatchCandidate[] {
    return [...this.candidates]
      .sort((a, b) => (b.aiScore ?? b.scoreCompatibilite) - (a.aiScore ?? a.scoreCompatibilite))
      .slice(0, 5);
  }

  scoreFor(candidate: TopMatchCandidate): number {
    return Math.round(candidate.aiScore ?? candidate.scoreCompatibilite ?? 0);
  }

  initials(candidate: TopMatchCandidate): string {
    const name = candidate.etudiantNom?.trim();
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  selectCandidate(candidate: TopMatchCandidate): void {
    this.candidateSelected.emit(candidate);
  }
}
