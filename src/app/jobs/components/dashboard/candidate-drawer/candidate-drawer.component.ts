import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { JobsAiService } from '../../../ai/ai.service';
import {
  AiCandidateSummaryResponse,
  AiMatchCandidateResponse,
  TopMatchCandidate
} from '../../../ai/models/ai.model';
import { poweredByText } from '../../../ai/providers/gemini.provider';

@Component({
  selector: 'app-candidate-drawer',
  templateUrl: './candidate-drawer.component.html',
  styleUrls: ['./candidate-drawer.component.css']
})
export class CandidateDrawerComponent implements OnChanges, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() open = false;
  @Input() candidate: TopMatchCandidate | null = null;
  @Input() offreId: number | null = null;

  @Output() closed = new EventEmitter<void>();

  loading = false;
  matchData: AiMatchCandidateResponse | null = null;
  summaryData: AiCandidateSummaryResponse | null = null;
  errorMessage = '';

  constructor(private aiService: JobsAiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['candidate'] || changes['open']) && this.open && this.candidate && this.offreId) {
      this.loadAiData(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get poweredBy(): string {
    return poweredByText(this.summaryData?.provider ?? this.matchData?.provider);
  }

  close(): void {
    this.closed.emit();
  }

  regenerate(): void {
    this.loadAiData(true);
  }

  copySummary(): void {
    if (!this.summaryData?.summary) return;
    navigator.clipboard.writeText(this.summaryData.summary);
  }

  private loadAiData(forceRefresh: boolean): void {
    if (!this.candidate || !this.offreId) return;

    this.loading = true;
    this.errorMessage = '';

    this.aiService.matchCandidate({
      offreId: this.offreId,
      etudiantId: this.candidate.etudiantId,
      candidatureId: this.candidate.candidatureId,
      forceRefresh
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (match) => {
        this.matchData = match;
        this.aiService.candidateSummary({
          offreId: this.offreId!,
          etudiantId: this.candidate!.etudiantId,
          candidatureId: this.candidate!.candidatureId,
          matchData: match,
          forceRefresh
        }).pipe(takeUntil(this.destroy$)).subscribe({
          next: (summary) => {
            this.summaryData = summary;
            this.loading = false;
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Failed to generate summary.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to match candidate.';
        this.loading = false;
      }
    });
  }
}
