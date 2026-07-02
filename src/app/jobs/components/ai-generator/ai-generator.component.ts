import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, switchMap } from 'rxjs';
import { JobAIService } from '../../services/job-ai.service';
import { poweredByText } from '../../ai/providers/gemini.provider';
import { JobsService } from '../../services/jobs.service';
import { EntrepriseContextService } from '../../../services/entreprise-context.service';
import { navigateJobs } from '../../jobs-router.util';
import {
  AIGenerateRequest,
  AIGenerateResponse,
  AIImproveRequest,
  CONTRACT_TYPE_LABELS,
  ContractType,
  ExperienceLevel,
  EXPERIENCE_LEVEL_LABELS,
  OUTPUT_LANGUAGE_LABELS,
  OutputLanguage
} from '../../models/job.model';

@Component({
  selector: 'app-ai-generator',
  templateUrl: './ai-generator.component.html',
  styleUrls: ['./ai-generator.component.css']
})
export class AiGeneratorComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  activeTab: 'generate' | 'improve' = 'generate';

  title = '';
  skillsInput = '';
  experienceLevel: ExperienceLevel = 'JUNIOR';
  contractType: ContractType = 'STAGE';
  additionalPrompt = '';
  outputLanguage: OutputLanguage = 'en';

  improveText = '';
  improveJobTitle = '';

  isGenerating = false;
  isSaving = false;
  hasGenerated = false;
  errorMessage = '';
  successMessage = '';

  generatedContent: AIGenerateResponse | null = null;
  aiProvider?: string;
  aiCached = false;

  readonly contractTypes = Object.keys(CONTRACT_TYPE_LABELS) as ContractType[];
  readonly experienceLevels = Object.keys(EXPERIENCE_LEVEL_LABELS) as ExperienceLevel[];
  readonly contractTypeLabels = CONTRACT_TYPE_LABELS;
  readonly experienceLevelLabels = EXPERIENCE_LEVEL_LABELS;
  readonly languageOptions = Object.entries(OUTPUT_LANGUAGE_LABELS).map(([value, label]) => ({
    value: value as OutputLanguage,
    label
  }));

  constructor(
    private aiService: JobAIService,
    private jobsService: JobsService,
    private entrepriseContext: EntrepriseContextService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get skills(): string[] {
    return this.skillsInput
      .split(',')
      .map(skill => skill.trim())
      .filter(Boolean);
  }

  get canGenerate(): boolean {
    if (this.activeTab === 'improve') {
      return this.improveText.trim().length > 0;
    }
    return this.title.trim().length > 0 && !!this.experienceLevel;
  }

  setTab(tab: 'generate' | 'improve'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  generate(forceRefresh = false): void {
    if (!this.canGenerate || this.isGenerating) return;

    this.isGenerating = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.activeTab === 'improve') {
      const request: AIImproveRequest = {
        originalText: this.improveText.trim(),
        jobTitle: this.improveJobTitle.trim() || this.title.trim() || undefined,
        outputLanguage: this.outputLanguage
      };

      this.aiService.improveJobDescription(request, forceRefresh)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => this.handleGenerationSuccess(response),
          error: (error) => this.handleGenerationError(error)
        });
      return;
    }

    const request: AIGenerateRequest = {
      title: this.title.trim(),
      skills: this.skills,
      experienceLevel: this.experienceLevel,
      contractType: this.contractType,
      additionalPrompt: this.additionalPrompt.trim() || undefined,
      outputLanguage: this.outputLanguage
    };

    this.aiService.generateJobDescription(request, forceRefresh)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.handleGenerationSuccess(response),
        error: (error) => this.handleGenerationError(error)
      });
  }

  regenerate(): void {
    this.generate(true);
  }

  copyGenerated(): void {
    if (!this.generatedContent) return;
    const text = [
      this.generatedContent.description,
      this.generatedContent.responsibilities,
      this.generatedContent.requirements,
      this.generatedContent.benefits,
      this.generatedContent.recruitmentText
    ].filter(Boolean).join('\n\n');
    navigator.clipboard.writeText(text);
  }

  get poweredBy(): string {
    return poweredByText(this.aiProvider);
  }

  acceptAndSave(): void {
    if (!this.generatedContent || this.isSaving) return;

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);

    const jobTitle = this.title.trim() || this.generatedContent.suggestedTitle || 'Job Offer';
    const requiredSkills = this.skills.length > 0
      ? this.skills
      : (this.generatedContent.suggestedSkills || ['Communication']);

    this.isSaving = true;
    this.errorMessage = '';

    const payload = {
      title: jobTitle,
      contractType: this.contractType,
      department: 'General',
      experienceLevel: this.experienceLevel,
      numberOfPositions: 1,
      workMode: 'HYBRID',
      location: 'Tunis',
      deadline: deadline.toISOString().split('T')[0] as any,
      requiredSkills,
      technologies: requiredSkills,
      languages: ['English'],
      description: this.generatedContent.description,
      responsibilities: this.generatedContent.responsibilities,
      requirements: this.generatedContent.requirements,
      benefits: this.generatedContent.benefits || '',
      status: 'ACTIVE'
    } as any;

    this.entrepriseContext.getEntrepriseId().pipe(
      switchMap((entrepriseId) => {
        payload.entrepriseId = entrepriseId;
        return this.jobsService.createJob(payload);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Job offer saved successfully.';
        setTimeout(() => navigateJobs(this.router, this.route, ['all']), 800);
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = error.error?.message || 'Failed to save the job offer.';
      }
    });
  }

  goBack(): void {
    navigateJobs(this.router, this.route, ['all']);
  }

  private handleGenerationSuccess(response: AIGenerateResponse & { provider?: string; cached?: boolean }): void {
    this.generatedContent = response;
    this.aiProvider = response.provider;
    this.aiCached = !!response.cached;
    this.hasGenerated = true;
    this.isGenerating = false;
    if (!this.title.trim() && response.suggestedTitle) {
      this.title = response.suggestedTitle;
    }
  }

  private handleGenerationError(error: any): void {
    this.isGenerating = false;
    this.errorMessage = error.error?.message || 'Failed to generate content. Please try again.';
  }
}
