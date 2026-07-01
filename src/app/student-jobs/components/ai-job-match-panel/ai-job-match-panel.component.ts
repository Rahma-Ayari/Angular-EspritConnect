import { Component, Input } from '@angular/core';
import { StudentJobMatchResult, matchLabelFromScore } from '../../models/student-ai.model';

@Component({
  selector: 'app-ai-job-match-panel',
  templateUrl: './ai-job-match-panel.component.html',
  styleUrls: ['./ai-job-match-panel.component.css']
})
export class AiJobMatchPanelComponent {
  @Input() result?: StudentJobMatchResult;
  @Input() loading = false;

  scoreColor(score: number): string {
    if (score >= 85) return '#16a34a';
    if (score >= 70) return '#ca8a04';
    return '#ea580c';
  }

  label(score: number): string {
    return matchLabelFromScore(score);
  }
}
