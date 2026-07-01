import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { JobsAiService } from '../../../ai/ai.service';
import { AiRecruitmentInsightsResponse } from '../../../ai/models/ai.model';
import { poweredByText } from '../../../ai/providers/gemini.provider';

@Component({
  selector: 'app-ai-insights-panel',
  templateUrl: './ai-insights-panel.component.html',
  styleUrls: ['./ai-insights-panel.component.css']
})
export class AiInsightsPanelComponent implements OnChanges, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() totalOffers = 0;
  @Input() activeOffers = 0;
  @Input() totalApplications = 0;
  @Input() avgApplications = 0;
  @Input() topScores: number[] = [];
  @Input() entrepriseId: number | null = null;
  @Input() selectedOffreId: number | null = null;

  loading = false;
  insights: AiRecruitmentInsightsResponse | null = null;
  errorMessage = '';

  constructor(private aiService: JobsAiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalOffers'] || changes['totalApplications'] || changes['selectedOffreId']) {
      this.loadInsights(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get poweredBy(): string {
    return poweredByText(this.insights?.provider);
  }

  regenerate(): void {
    this.loadInsights(true);
  }

  copyInsights(): void {
    if (!this.insights) return;
    const text = [this.insights.summary, ...this.insights.insights].join('\n\n');
    navigator.clipboard.writeText(text);
  }

  private loadInsights(forceRefresh: boolean): void {
    if (this.totalOffers === 0 && this.totalApplications === 0) return;

    this.loading = true;
    this.errorMessage = '';

    this.aiService.recruitmentInsights({
      entrepriseId: this.entrepriseId ?? undefined,
      offreId: this.selectedOffreId ?? undefined,
      totalOffers: this.totalOffers,
      activeOffers: this.activeOffers,
      totalApplications: this.totalApplications,
      avgApplicationsPerOffer: this.avgApplications,
      topCandidateScores: this.topScores,
      forceRefresh
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.insights = res;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load AI insights.';
        this.loading = false;
      }
    });
  }
}
