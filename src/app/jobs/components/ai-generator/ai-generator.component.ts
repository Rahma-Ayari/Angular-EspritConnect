import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { JobAIService } from '../../services/job-ai.service';
import { JobsService } from '../../services/jobs.service';
import { AuthService } from '../../../auth.service';
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
    private authService: AuthService,
    private router: Router
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

  generate(): void {
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

      this.aiService.improveJobDescription(request)
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

    this.aiService.generateJobDescription(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => this.handleGenerationSuccess(response),
        error: (error) => this.handleGenerationError(error)
      });
  }

  acceptAndSave(): void {
    if (!this.generatedContent || this.isSaving) return;

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.errorMessage = 'You must be logged in to save an offer.';
      return;
    }

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 30);

    const jobTitle = this.title.trim() || this.generatedContent.suggestedTitle || 'Job Offer';
    const requiredSkills = this.skills.length > 0
      ? this.skills
      : (this.generatedContent.suggestedSkills || ['Communication']);

    this.isSaving = true;
    this.errorMessage = '';

    this.jobsService.createJob({
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
      status: 'ACTIVE',
      entrepriseId: parseInt(currentUser.userId, 10)
    } as any).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isSaving = false;
        this.successMessage = 'Job offer saved successfully.';
        setTimeout(() => this.router.navigate(['/dashboard/jobs/all']), 800);
      },
      error: (error) => {
        this.isSaving = false;
        this.errorMessage = error.error?.message || 'Failed to save the job offer.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/jobs/all']);
  }

  private handleGenerationSuccess(response: AIGenerateResponse): void {
    this.generatedContent = response;
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
