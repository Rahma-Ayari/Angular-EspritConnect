import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { JobsService } from '../../services/jobs.service';
import { AuthService } from '../../../auth.service';
import {
  JobOffer,
  ContractType,
  ExperienceLevel,
  WorkMode,
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.setupAutosave();
    this.checkEditMode();
    this.applyImportedJobFromNavigation();
  }

  private applyImportedJobFromNavigation(): void {
    const importedJob = history.state?.importedJob;
    if (!importedJob) return;

    if (importedJob.title) {
      this.step1Form.patchValue({ title: importedJob.title });
    }
    if (importedJob.contractType) {
      this.step1Form.patchValue({ contractType: importedJob.contractType });
    }
    if (importedJob.location) {
      this.step2Form.patchValue({ location: importedJob.location });
    }
    if (importedJob.skills?.length) {
      this.step3Form.patchValue({ requiredSkills: importedJob.skills });
    }
    if (importedJob.description) {
      this.step4Form.patchValue({ description: importedJob.description });
    }
    if (importedJob.requirements) {
      this.step4Form.patchValue({ requirements: importedJob.requirements });
    }

    this.currentStep = 4;
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
    // Autosave every 30 seconds
    this.step1Form.valueChanges
      .pipe(debounceTime(30000), takeUntil(this.destroy$))
      .subscribe(() => this.saveDraft());
      
    this.step2Form.valueChanges
      .pipe(debounceTime(30000), takeUntil(this.destroy$))
      .subscribe(() => this.saveDraft());
      
    this.step3Form.valueChanges
      .pipe(debounceTime(30000), takeUntil(this.destroy$))
      .subscribe(() => this.saveDraft());
      
    this.step4Form.valueChanges
      .pipe(debounceTime(30000), takeUntil(this.destroy$))
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
    if (!this.step1Form.valid) return;

    this.isSaving = true;
    const jobData: any = this.collectFormData();
    jobData.status = 'DRAFT';
    
    // Get current user and add entrepriseId
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      jobData.entrepriseId = parseInt(currentUser.userId);
    }

    const saveObservable = this.isEditMode && this.jobId
      ? this.jobsService.updateDraft(this.jobId, jobData)
      : this.jobsService.saveDraft(jobData);

    saveObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (job) => {
          if (!this.isEditMode) {
            this.isEditMode = true;
            this.jobId = job.id;
          }
          this.lastSaved = new Date();
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Error saving draft:', err);
          this.isSaving = false;
        }
      });
  }

  publish(): void {
    if (!this.isAllFormsValid()) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    const jobData: any = this.collectFormData();
    jobData.status = 'ACTIVE';
    
    // Get current user and add entrepriseId
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      // Use the user's userId as entrepriseId
      jobData.entrepriseId = parseInt(currentUser.userId);
    }

    const publishObservable = this.isEditMode && this.jobId
      ? this.jobsService.updateJob(this.jobId, jobData)
      : this.jobsService.createJob(jobData);

    publishObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/dashboard/jobs/all']);
        },
        error: (err) => {
          console.error('Error publishing job:', err);
          this.error = err.error?.message || 'Failed to publish job offer';
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
      this.router.navigate(['/dashboard/jobs/all']);
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
