import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { JobsAiService } from '../../../ai/ai.service';
import { EntrepriseJobDashboardService } from '../../../../services/entreprise-job-dashboard.service';
import {
  AiCandidateSummaryResponse,
  AiMatchCandidateResponse,
  TopMatchCandidate
} from '../../../ai/models/ai.model';

type ApplicationDecision = 'EN_ENTRETIEN' | 'ACCEPTEE' | 'REFUSEE';

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
  @Output() statusUpdated = new EventEmitter<{ candidatureId: number; statut: string }>();

  summaryLoading = false;
  actionLoading = false;
  aiConfigured = false;
  matchData: AiMatchCandidateResponse | null = null;
  summaryData: AiCandidateSummaryResponse | null = null;
  errorMessage = '';
  actionMessage = '';

  constructor(
    private aiService: JobsAiService,
    private dashboardService: EntrepriseJobDashboardService
  ) {
    this.aiService.getStatus().pipe(takeUntil(this.destroy$)).subscribe({
      next: (s) => (this.aiConfigured = !!s.configured),
      error: () => (this.aiConfigured = false)
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['candidate'] || changes['open']) && this.open && this.candidate && this.offreId) {
      this.showProfileMatch();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get poweredBy(): string {
    if (this.summaryData?.provider) {
      return `Powered by ${this.summaryData.provider}`;
    }
    return 'Profile-based match (instant)';
  }

  get statusLabel(): string {
    const s = this.candidate?.candidatureStatus || 'EN_ATTENTE';
    const labels: Record<string, string> = {
      EN_ATTENTE: 'Pending review',
      EN_ENTRETIEN: 'Interview stage',
      ACCEPTEE: 'Accepted',
      REFUSEE: 'Declined'
    };
    return labels[s] || s;
  }

  get canProceed(): boolean {
    return this.candidate?.candidatureStatus === 'EN_ATTENTE';
  }

  get canAcceptDecline(): boolean {
    const s = this.candidate?.candidatureStatus;
    return s === 'EN_ATTENTE' || s === 'EN_ENTRETIEN';
  }

  get isFinalized(): boolean {
    const s = this.candidate?.candidatureStatus;
    return s === 'ACCEPTEE' || s === 'REFUSEE';
  }

  close(): void {
    this.closed.emit();
  }

  regenerate(): void {
    if (!this.aiConfigured) {
      this.errorMessage = 'AI is not configured on the server. Scores use the same logic as the student job match.';
      return;
    }
    this.loadAiSummary(true);
  }

  copySummary(): void {
    const text = this.summaryData?.summary || this.buildLocalSummaryText();
    if (!text) return;
    navigator.clipboard.writeText(text);
  }

  proceedWithCandidate(): void {
    this.decide('EN_ENTRETIEN', 'Candidate moved to interview stage. Student notified by email.');
  }

  acceptCandidate(): void {
    this.decide('ACCEPTEE', 'Application accepted. Congratulations email sent to the student.');
  }

  declineCandidate(): void {
    if (!confirm('Decline this application? The student will receive a notification email.')) {
      return;
    }
    this.decide('REFUSEE', 'Application declined. Student notified by email.');
  }

  private decide(statut: ApplicationDecision, successMsg: string): void {
    if (!this.candidate?.candidatureId || this.actionLoading) return;

    this.actionLoading = true;
    this.actionMessage = '';
    this.errorMessage = '';

    this.dashboardService
      .updateApplicationStatus(this.candidate.candidatureId, statut)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const updated = res.statutCandidature || statut;
          if (this.candidate) {
            this.candidate = { ...this.candidate, candidatureStatus: updated };
          }
          this.actionMessage = successMsg;
          this.actionLoading = false;
          this.statusUpdated.emit({ candidatureId: this.candidate!.candidatureId, statut: updated });
        },
        error: (err) => {
          this.errorMessage = err?.error?.message || 'Could not update application status.';
          this.actionLoading = false;
        }
      });
  }

  private showProfileMatch(): void {
    if (!this.candidate) return;
    this.errorMessage = '';
    this.actionMessage = '';
    this.summaryLoading = false;
    this.summaryData = null;
    this.matchData = this.buildHeuristicMatch(this.candidate);
    this.summaryData = {
      summary: this.buildLocalSummaryText(),
      overallScore: this.matchData.overallScore,
      recommendation: this.matchData.recommendation
    };
  }

  private loadAiSummary(forceRefresh: boolean): void {
    if (!this.candidate || !this.offreId || !this.matchData) return;

    this.summaryLoading = true;
    this.errorMessage = '';

    this.aiService.candidateSummary({
      offreId: this.offreId,
      etudiantId: this.candidate.etudiantId,
      candidatureId: this.candidate.candidatureId,
      matchData: this.matchData,
      forceRefresh
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (summary) => {
        this.summaryData = summary;
        this.summaryLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'AI summary unavailable.';
        this.summaryLoading = false;
      }
    });
  }

  private buildHeuristicMatch(candidate: TopMatchCandidate): AiMatchCandidateResponse {
    const overall = Math.round(candidate.aiScore ?? candidate.scoreCompatibilite ?? 0);
    const skills = candidate.skillsScore ?? overall;
    const experience = candidate.experienceScore ?? Math.round(overall * 0.85);
    const education = candidate.educationScore ?? Math.round(overall * 0.7);
    const matched = candidate.skillsMatched || [];

    return {
      overallScore: overall,
      skillsScore: skills,
      experienceScore: experience,
      educationScore: education,
      matchingSkills: matched,
      missingSkills: [],
      strengths: matched.length ? [`Matches required skills: ${matched.join(', ')}`] : ['No direct skill overlap yet'],
      weaknesses: matched.length ? [] : ['Candidate may need upskilling on required technologies'],
      recommendation: candidate.recommendation || this.defaultRecommendation(overall),
      etudiantId: candidate.etudiantId,
      offreId: this.offreId ?? undefined,
      etudiantNom: candidate.etudiantNom
    };
  }

  private buildLocalSummaryText(): string {
    if (!this.candidate || !this.matchData) return '';
    const c = this.candidate;
    const m = this.matchData;
    const parts = [
      `${c.etudiantNom} scores ${m.overallScore}% for this role.`,
      m.matchingSkills?.length
        ? `Matching skills: ${m.matchingSkills.join(', ')}.`
        : 'No required skills matched on the student profile yet.',
      `Skills ${m.skillsScore}%, experience fit ${m.experienceScore}%, education fit ${m.educationScore}%.`,
      m.recommendation
    ];
    return parts.filter(Boolean).join(' ');
  }

  private defaultRecommendation(score: number): string {
    if (score >= 70) return 'Strong match — recommend interview';
    if (score >= 45) return 'Moderate match — review profile and consider interview';
    return 'Weak match — review carefully before proceeding';
  }
}
