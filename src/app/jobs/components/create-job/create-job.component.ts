import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime, switchMap, merge, finalize } from 'rxjs';
import { JobsService } from '../../services/jobs.service';
import { AuthService } from '../../../auth.service';
import { EntrepriseContextService } from '../../../services/entreprise-context.service';
import { navigateJobs } from '../../jobs-router.util';
import {
  JobOffer,
  ContractType,
  ExperienceLevel,
  WorkMode,
  ImportJobResponse,
  CONTRACT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  WORK_MODE_LABELS,
  AIGenerateResponse
} from '../../models/job.model';

@Component({
  selector: 'app-create-job',
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.css']
})
export class CreateJobComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentStep = 1;
  totalSteps = 4;
  isEditMode = false;
  jobId?: number;

  // Forms
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;
  step4Form!: FormGroup;

  // Autosave
  isSaving = false;
  lastSaved?: Date;
  private autosavePaused = true;
  private draftSaveInFlight = false;

  // Submit
  isSubmitting = false;
  error = '';

  // Constants
  readonly contractTypes = Object.keys(CONTRACT_TYPE_LABELS) as ContractType[];
  readonly experienceLevels = Object.keys(EXPERIENCE_LEVEL_LABELS) as ExperienceLevel[];
  readonly workModes = Object.keys(WORK_MODE_LABELS) as WorkMode[];
  readonly contractTypeLabels = CONTRACT_TYPE_LABELS;
  readonly experienceLevelLabels = EXPERIENCE_LEVEL_LABELS;
  readonly workModeLabels = WORK_MODE_LABELS;

  // Skills suggestions
  skillsSuggestions: string[] = [
    'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Node.js',
    'Python', 'Java', 'C#', 'PHP', 'SQL', 'MongoDB', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'Git', 'Agile', 'Scrum', 'UX/UI', 'Figma', 'DevOps'
  ];

  techSuggestions: string[] = [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'NestJS',
    'Spring Boot', 'Django', 'Flask', 'Laravel', 'PostgreSQL', 'MySQL',
    'MongoDB', 'Redis', 'Elasticsearch', 'Docker', 'Kubernetes', 'Jenkins'
  ];

  languageSuggestions: string[] = [
    'French', 'English', 'Arabic', 'German', 'Spanish', 'Italian'
  ];

  // UI State
  showAIPanel = false;
  
  constructor(
    private fb: FormBuilder,
    private jobsService: JobsService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private entrepriseContext: EntrepriseContextService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.setupAutosave();
    this.checkEditMode();
    this.applyImportedJobFromNavigation();
    if (!history.state?.importedJob) {
      this.autosavePaused = false;
    }
  }

  private applyImportedJobFromNavigation(): void {
    const importedJob = history.state?.importedJob as ImportJobResponse | undefined;
    if (!importedJob) return;

    const description = (importedJob.description || '').trim();
    if (this.isWeakLinkedInImport(description, importedJob.title)) {
      this.error =
        'LinkedIn URL import only returned a short preview. Open the job on LinkedIn, ' +
        'copy the full description, and use TEXT import for accurate results.';
      return;
    }

    const skills = importedJob.skills?.length ? importedJob.skills : this.inferSkillsFromText(description);
    const step4 = this.buildStep4FromImport(importedJob, description);
    const experienceLevel = this.normalizeExperienceLevel(
      importedJob.experienceLevel || importedJob.extractedData?.['experienceLevel'],
      description
    );

    this.step1Form.patchValue({
      title: this.sanitizeTitle(importedJob.title),
      contractType: this.normalizeContractType(importedJob.contractType),
      department: this.guessDepartment(description),
      experienceLevel,
      numberOfPositions: 1
    });

    this.step2Form.patchValue({
      workMode: this.guessWorkMode(description),
      location: this.sanitizeLocation(importedJob.location, description),
      deadline: this.defaultDeadlineIso()
    });

    this.step3Form.patchValue({
      requiredSkills: skills,
      technologies: skills.slice(0, 5),
      languages: ['English']
    });

    this.step4Form.patchValue(step4);

    [this.step1Form, this.step2Form, this.step3Form, this.step4Form].forEach((f) => f.updateValueAndValidity());
    this.currentStep = 4;
    setTimeout(() => {
      this.autosavePaused = false;
    }, 5000);
  }

  private sanitizeTitle(title?: string): string {
    if (!title?.trim()) return 'Imported job offer';
    return title.replace(/\s*\|\s*LinkedIn\s*$/i, '').trim();
  }

  private sanitizeLocation(location?: string, description?: string): string {
    const candidate = (location || '').trim();
    if (candidate && candidate.length <= 80 && !/employees work|similar jobs|linkedin/i.test(candidate)) {
      return candidate;
    }
    const match = description?.match(/\bin\s+([A-Za-z][A-Za-z\s.'-]+,\s*[A-Z]{2})\b/);
    if (match) return match[1].trim();
    return 'Tunis, Tunisia';
  }

  private guessWorkMode(text: string): WorkMode {
    const lower = text.toLowerCase();
    if (lower.includes('remote') && !lower.includes('hybrid')) return 'REMOTE';
    if (lower.includes('hybrid')) return 'HYBRID';
    if (lower.includes('on-site') || lower.includes('onsite')) return 'ON_SITE';
    return 'HYBRID';
  }

  private normalizeExperienceLevel(value: unknown, text: string): ExperienceLevel {
    const allowed: ExperienceLevel[] = ['JUNIOR', 'INTERMEDIATE', 'SENIOR', 'EXPERT'];
    if (typeof value === 'string' && allowed.includes(value as ExperienceLevel)) {
      return value as ExperienceLevel;
    }
    return this.guessExperienceLevel(text);
  }

  private inferSkillsFromText(text: string): string[] {
    const catalog = [
      'Node.js', 'Python', 'Go', 'Kubernetes', 'Docker', 'React', 'Angular', 'TypeScript',
      'Java', 'Spring Boot', 'MySQL', 'PostgreSQL', 'MongoDB', 'AWS', 'CI/CD'
    ];
    const lower = text.toLowerCase();
    const found = catalog.filter(s => lower.includes(s.toLowerCase()));
    return found.length ? found : ['Communication'];
  }

  private buildStep4FromImport(importedJob: ImportJobResponse, description: string): {
    description: string;
    responsibilities: string;
    requirements: string;
    benefits: string;
  } {
    let desc = description;
    let responsibilities = (importedJob.responsibilities || '').trim();
    let requirements = (importedJob.requirements || '').trim();

    if (!responsibilities) {
      responsibilities = this.extractSection(description, [
        'participation', 'conception', 'développement', 'developpement',
        'what you', 'your mission', 'what you’ll', 'missions', 'responsabilit'
      ]);
    }

    if (this.isDuplicateText(responsibilities, desc)) {
      responsibilities = '';
    }
    if (this.isDuplicateText(requirements, desc) || this.isDuplicateText(requirements, responsibilities)) {
      requirements = '';
    }

    if (!requirements) {
      requirements = this.extractSection(description, [
        'profil recherché', 'profil requis', 'qualifications', 'exigences',
        'minimum', 'ans d\'expérience', 'bac +', 'requirements'
      ]);
    }
    if (this.isDuplicateText(requirements, desc)) {
      requirements = '';
    }

    return {
      description: desc.length >= 50 ? desc : `${desc} (imported)`,
      responsibilities: responsibilities.length >= 10
        ? responsibilities.substring(0, 3000)
        : 'Describe the main missions and day-to-day responsibilities for this role.',
      requirements: requirements.length >= 10
        ? requirements.substring(0, 3000)
        : 'List required skills, experience, and qualifications for candidates.',
      benefits: (importedJob.benefits || '').trim()
    };
  }

  private isDuplicateText(a: string, b: string): boolean {
    if (!a?.trim() || !b?.trim()) {
      return false;
    }
    const na = a.trim().toLowerCase().replace(/\s+/g, ' ');
    const nb = b.trim().toLowerCase().replace(/\s+/g, ' ');
    if (na === nb) {
      return true;
    }
    const len = Math.min(160, na.length, nb.length);
    return len > 40 && na.substring(0, len) === nb.substring(0, len);
  }

  private normalizeContractType(value?: string): ContractType {
    const allowed: ContractType[] = ['STAGE', 'EMPLOI', 'APPRENTISSAGE', 'PFE'];
    if (value && allowed.includes(value as ContractType)) {
      return value as ContractType;
    }
    return 'EMPLOI';
  }

  private guessDepartment(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('engineering') || lower.includes('developer') || lower.includes('software')) {
      return 'Engineering';
    }
    if (lower.includes('marketing')) return 'Marketing';
    if (lower.includes('design') || lower.includes('ux')) return 'Design';
    return 'General';
  }

  private guessExperienceLevel(text: string): ExperienceLevel {
    const lower = text.toLowerCase();
    if (lower.includes('senior') || lower.includes('lead')) return 'SENIOR';
    if (lower.includes('intermediate') || lower.includes('mid')) return 'INTERMEDIATE';
    if (lower.includes('expert') || lower.includes('principal')) return 'EXPERT';
    return 'JUNIOR';
  }

  private defaultDeadlineIso(): string {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 10);
  }

  private isWeakLinkedInImport(description: string, title?: string): boolean {
    const d = description.trim().toLowerCase();
    if (d.length < 120) {
      return true;
    }
    if (d.includes("see what you're missing") || d.includes('similar jobs on linkedin')) {
      return true;
    }
    if (/\|\s*linkedin\s*$/i.test(description.trim()) && d.length < 300) {
      return true;
    }
    if (title && description.trim() === title.trim()) {
      return true;
    }
    return false;
  }

  private extractSection(text: string, markers: string[]): string {
    const lower = text.toLowerCase();
    for (const marker of markers) {
      const idx = lower.indexOf(marker);
      if (idx >= 0) {
        return text.substring(idx).trim();
      }
    }
    return '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForms(): void {
    // Step 1: Basic Info
    this.step1Form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      contractType: ['STAGE', Validators.required],
      department: ['', Validators.required],
      experienceLevel: ['JUNIOR', Validators.required],
      numberOfPositions: [1, [Validators.required, Validators.min(1)]]
    });

    // Step 2: Work Info
    this.step2Form = this.fb.group({
      workMode: ['HYBRID', Validators.required],
      location: ['', Validators.required],
      salaryMin: [null],
      salaryMax: [null],
      duration: [''],
      deadline: ['', Validators.required]
    });

    // Step 3: Skills
    this.step3Form = this.fb.group({
      requiredSkills: [[], Validators.required],
      technologies: [[]],
      languages: [[]]
    });

    // Step 4: Job Content
    this.step4Form = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(50)]],
      responsibilities: ['', Validators.required],
      requirements: ['', Validators.required],
      benefits: ['']
    });
  }

  setupAutosave(): void {
    merge(
      this.step1Form.valueChanges,
      this.step2Form.valueChanges,
      this.step3Form.valueChanges,
      this.step4Form.valueChanges
    )
      .pipe(debounceTime(45000), takeUntil(this.destroy$))
      .subscribe(() => this.saveDraft());
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.jobId = parseInt(id);
      this.loadJob(this.jobId);
    }
  }

  loadJob(id: number): void {
    this.jobsService.getJobById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (job) => {
          this.populateForms(job);
        },
        error: (err) => {
          this.error = 'Failed to load job offer';
          console.error(err);
        }
      });
  }

  populateForms(job: JobOffer): void {
    this.step1Form.patchValue({
      title: job.title,
      contractType: job.contractType,
      department: job.department,
      experienceLevel: job.experienceLevel,
      numberOfPositions: job.numberOfPositions
    });

    this.step2Form.patchValue({
      workMode: job.workMode,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      duration: job.duration,
      deadline: new Date(job.deadline).toISOString().split('T')[0]
    });

    this.step3Form.patchValue({
      requiredSkills: job.requiredSkills,
      technologies: job.technologies,
      languages: job.languages
    });

    this.step4Form.patchValue({
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      benefits: job.benefits
    });
  }

  // Navigation
  nextStep(): void {
    if (!this.isCurrentStepValid()) {
      this.markCurrentStepAsTouched();
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep || this.isStepAccessible(step)) {
      this.currentStep = step;
    }
  }

  isCurrentStepValid(): boolean {
    return this.getCurrentForm().valid;
  }

  isStepAccessible(step: number): boolean {
    // Can access a step if all previous steps are valid
    for (let i = 1; i < step; i++) {
      if (!this.getFormForStep(i).valid) {
        return false;
      }
    }
    return true;
  }

  getCurrentForm(): FormGroup {
    return this.getFormForStep(this.currentStep);
  }

  getFormForStep(step: number): FormGroup {
    switch (step) {
      case 1: return this.step1Form;
      case 2: return this.step2Form;
      case 3: return this.step3Form;
      case 4: return this.step4Form;
      default: return this.step1Form;
    }
  }

  markCurrentStepAsTouched(): void {
    const form = this.getCurrentForm();
    Object.keys(form.controls).forEach(key => {
      form.controls[key].markAsTouched();
    });
  }

  // AI Integration
  onAIContentGenerated(content: AIGenerateResponse): void {
    this.step4Form.patchValue({
      description: content.description,
      responsibilities: content.responsibilities,
      requirements: content.requirements,
      benefits: content.benefits
    });
  }

  get aiJobData() {
    return {
      title: this.step1Form.get('title')?.value,
      contractType: this.step1Form.get('contractType')?.value,
      department: this.step1Form.get('department')?.value,
      experienceLevel: this.step1Form.get('experienceLevel')?.value,
      location: this.step2Form.get('location')?.value,
      skills: this.step3Form.get('requiredSkills')?.value || []
    };
  }

  // Save & Submit
  saveDraft(): void {
    if (!this.step1Form.valid || this.autosavePaused || this.draftSaveInFlight || this.isSubmitting) {
      return;
    }

    this.draftSaveInFlight = true;
    this.isSaving = true;
    const jobData: any = this.collectFormData();
    jobData.status = 'DRAFT';

    this.entrepriseContext.getEntrepriseId()
      .pipe(
        switchMap((entrepriseId) => {
          jobData.entrepriseId = entrepriseId;
          return this.isEditMode && this.jobId
            ? this.jobsService.updateDraft(this.jobId, jobData)
            : this.jobsService.saveDraft(jobData);
        }),
        finalize(() => {
          this.draftSaveInFlight = false;
          this.isSaving = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (job) => {
          if (!this.isEditMode) {
            this.isEditMode = true;
            this.jobId = job.id;
          }
          this.lastSaved = new Date();
        },
        error: (err) => {
          console.error('Error saving draft:', err);
        }
      });
  }

  publish(): void {
    if (!this.isAllFormsValid()) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.autosavePaused = true;
    this.isSubmitting = true;
    this.error = '';
    const jobData: any = this.collectFormData();
    jobData.status = 'ACTIVE';

    this.entrepriseContext.getEntrepriseId()
      .pipe(
        switchMap((entrepriseId) => {
          jobData.entrepriseId = entrepriseId;
          return this.isEditMode && this.jobId
            ? this.jobsService.updateJob(this.jobId, jobData)
            : this.jobsService.createJob(jobData);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          navigateJobs(this.router, this.route, ['all']);
        },
        error: (err) => {
          console.error('Error publishing job:', err);
          this.autosavePaused = false;
          this.error =
            err?.message ||
            err.error?.message ||
            err.error?.error ||
            'Failed to publish job offer. Sign in with an enterprise account and try again.';
          this.isSubmitting = false;
        }
      });
  }

  isAllFormsValid(): boolean {
    return this.step1Form.valid &&
           this.step2Form.valid &&
           this.step3Form.valid &&
           this.step4Form.valid;
  }

  collectFormData(): Partial<JobOffer> {
    return {
      ...this.step1Form.value,
      ...this.step2Form.value,
      ...this.step3Form.value,
      ...this.step4Form.value
    };
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      navigateJobs(this.router, this.route, ['all']);
    }
  }

  toggleAIAssistant(): void {
    this.showAIPanel = !this.showAIPanel;
  }

  openAIGenerator(field: string): void {
    this.showAIPanel = true;
  }

  getJobInfoForAI(): any {
    return {
      title: this.step1Form.get('title')?.value,
      department: this.step1Form.get('department')?.value,
      contractType: this.step1Form.get('contractType')?.value,
      experienceLevel: this.step1Form.get('experienceLevel')?.value,
      location: this.step2Form.get('location')?.value,
      skills: this.step3Form.get('requiredSkills')?.value || [],
      technologies: this.step3Form.get('technologies')?.value || []
    };
  }

  handleAIContent(content: AIGenerateResponse): void {
    if (content.suggestedTitle && !this.step1Form.get('title')?.value) {
      this.step1Form.patchValue({ title: content.suggestedTitle });
    }
    if (content.suggestedSkills?.length && !(this.step3Form.get('requiredSkills')?.value || []).length) {
      this.step3Form.patchValue({ requiredSkills: content.suggestedSkills });
    }
    if (content.description) {
      this.step4Form.patchValue({ description: content.description });
    }
    if (content.responsibilities) {
      this.step4Form.patchValue({ responsibilities: content.responsibilities });
    }
    if (content.requirements) {
      this.step4Form.patchValue({ requirements: content.requirements });
    }
    if (content.benefits) {
      this.step4Form.patchValue({ benefits: content.benefits });
    }
    this.showAIPanel = false;
  }
}
