import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { JobAIService } from '../../../services/job-ai.service';
import {
  AIGenerateRequest,
  AIGenerateResponse,
  CONTRACT_TYPE_LABELS,
  ContractType,
  OUTPUT_LANGUAGE_LABELS,
  OutputLanguage
} from '../../../models/job.model';
import { poweredByText } from '../../../ai/providers/gemini.provider';

@Component({
  selector: 'app-ai-assistant-panel',
  templateUrl: './ai-assistant-panel.component.html',
  styleUrls: ['./ai-assistant-panel.component.css']
})
export class AIAssistantPanelComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() jobInfo: any;
  @Output() close = new EventEmitter<void>();
  @Output() contentGenerated = new EventEmitter<AIGenerateResponse>();

  isGenerating = false;
  hasGeneratedOnce = false;
  generatedContent: AIGenerateResponse | null = null;
  aiProvider?: string;
  aiCached = false;
  errorMessage = '';
  additionalPrompt = '';
  outputLanguage: OutputLanguage = 'en';

  contractTypeLabels = CONTRACT_TYPE_LABELS;
  languageOptions = Object.entries(OUTPUT_LANGUAGE_LABELS).map(([value, label]) => ({ value: value as OutputLanguage, label }));

  constructor(private aiService: JobAIService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasStructuredInputs(): boolean {
    return !!(this.jobInfo?.title && this.jobInfo?.department);
  }

  get canGenerate(): boolean {
    return this.additionalPrompt.trim().length > 0 || this.hasStructuredInputs;
  }

  regenerateContent(forceRefresh = false): void {
    if (!this.canGenerate || this.isGenerating) return;

    this.isGenerating = true;
    this.errorMessage = '';

    const request: AIGenerateRequest = {
      title: this.jobInfo?.title,
      skills: this.jobInfo?.skills || [],
      experienceLevel: this.jobInfo?.experienceLevel,
      contractType: this.jobInfo?.contractType,
      department: this.jobInfo?.department,
      location: this.jobInfo?.location,
      additionalPrompt: this.additionalPrompt.trim() || undefined,
      outputLanguage: this.outputLanguage
    };

    this.aiService.generateJobDescription(request, forceRefresh)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.generatedContent = response;
          this.aiProvider = response.provider;
          this.aiCached = !!response.cached;
          this.hasGeneratedOnce = true;
          this.isGenerating = false;
        },
        error: (error) => {
          console.error('AI generation error:', error);
          this.isGenerating = false;
          this.errorMessage = error.error?.message || 'Failed to generate content. Please try again.';
        }
      });
  }

  get poweredBy(): string {
    return poweredByText(this.aiProvider);
  }

  copyContent(): void {
    if (!this.generatedContent) return;
    const text = `Description:\n${this.generatedContent.description}\n\nResponsibilities:\n${this.generatedContent.responsibilities}\n\nRequirements:\n${this.generatedContent.requirements}\n\nBenefits:\n${this.generatedContent.benefits}`;
    navigator.clipboard.writeText(text).then(() => {
      console.log('Content copied to clipboard');
    });
  }

  acceptContent(): void {
    if (this.generatedContent) {
      this.contentGenerated.emit(this.generatedContent);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  getContractTypeLabel(type: string): string {
    if (!type) return '';
    return this.contractTypeLabels[type as ContractType] || type;
  }
}
