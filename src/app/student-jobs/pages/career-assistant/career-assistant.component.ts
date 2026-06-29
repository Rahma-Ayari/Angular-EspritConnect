import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobOffer } from '../../../jobs/models/job.model';
import { StudentAiService } from '../../services/student-ai.service';
import { ResumeStorageService } from '../../services/resume-storage.service';
import { StudentJobsBrowseService } from '../../services/student-jobs-browse.service';
import {
  StudentApplicationOptimizerResult,
  StudentCareerAdviceResult,
  StudentInterviewPrepResult,
  StudentResumeReviewResult
} from '../../models/student-ai.model';

type FeatureId = 'resume' | 'advice' | 'interview' | 'optimizer' | null;

@Component({
  selector: 'app-career-assistant',
  templateUrl: './career-assistant.component.html',
  styleUrls: ['./career-assistant.component.css']
})
export class CareerAssistantComponent implements OnInit {
  expanded: FeatureId = null;
  jobs: JobOffer[] = [];
  selectedJobId?: number;
  resumeText = '';
  question = '';
  quickPrompt = '';

  loading = false;
  error = '';
  provider = '';

  reviewResult?: StudentResumeReviewResult;
  adviceResult?: StudentCareerAdviceResult;
  interviewResult?: StudentInterviewPrepResult;
  optimizerResult?: StudentApplicationOptimizerResult;
  typingText = '';

  readonly suggestedPrompts = [
    'How can I improve my resume?',
    'Best tech companies in Tunisia for interns',
    'How to prepare for a React interview?'
  ];

  constructor(
    private studentAi: StudentAiService,
    private browse: StudentJobsBrowseService,
    private resumeStorage: ResumeStorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.browse.search({ limit: 30, page: 1 }).subscribe((r) => (this.jobs = r.data));
    const saved = this.resumeStorage.load();
    if (saved) this.resumeText = this.resumeStorage.toPlainText(saved);
  }

  toggle(id: FeatureId): void {
    this.expanded = this.expanded === id ? null : id;
    this.error = '';
  }

  onCvFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const isText = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
    if (isText) {
      const reader = new FileReader();
      reader.onload = () => {
        this.resumeText = String(reader.result || '');
        input.value = '';
      };
      reader.readAsText(file);
      return;
    }

    this.loading = true;
    this.error = '';
    this.studentAi.extractResume(file).subscribe({
      next: (res) => {
        this.resumeText = res.text || '';
        this.loading = false;
        input.value = '';
        if (!this.resumeText.trim()) {
          this.error = 'No readable text found in this file. It may be a scanned image.';
        }
      },
      error: (e) => {
        this.error = e.message;
        this.loading = false;
        input.value = '';
      }
    });
  }

  runReview(): void {
    if (!this.resumeText.trim()) {
      this.error = 'Upload or paste your resume first.';
      return;
    }
    this.callAi(() => this.studentAi.reviewResume(this.resumeText), (r) => {
      this.reviewResult = r as StudentResumeReviewResult;
    });
  }

  runAdvice(prompt?: string): void {
    const q = prompt || this.question || this.quickPrompt;
    if (!q.trim()) return;
    this.callAi(() => this.studentAi.careerAdvice(q), (r) => {
      this.adviceResult = r as StudentCareerAdviceResult;
      this.typewriter((r as StudentCareerAdviceResult).answer);
    });
  }

  runInterview(): void {
    const job = this.jobs.find((j) => j.id === this.selectedJobId);
    this.callAi(
      () =>
        this.studentAi.interviewPreparation({
          offreId: job?.id,
          jobTitle: job?.title,
          jobDescription: job?.description
        }),
      (r) => (this.interviewResult = r as StudentInterviewPrepResult)
    );
  }

  runOptimizer(): void {
    if (!this.selectedJobId || !this.resumeText.trim()) {
      this.error = 'Select a job and provide your resume.';
      return;
    }
    this.callAi(
      () => this.studentAi.applicationOptimizer(this.selectedJobId!, this.resumeText),
      (r) => (this.optimizerResult = r as StudentApplicationOptimizerResult)
    );
  }

  goToResumeStudio(): void {
    this.router.navigate(['/dashboard/jobs/resume-studio']);
  }

  goToCoverLetters(): void {
    this.router.navigate(['/dashboard/jobs/cover-letters']);
  }

  private callAi<T extends { provider?: string }>(fn: () => import('rxjs').Observable<T>, onSuccess: (r: T) => void): void {
    this.loading = true;
    this.error = '';
    fn().subscribe({
      next: (r) => {
        this.provider = r.provider || '';
        onSuccess(r);
        this.loading = false;
      },
      error: (e) => {
        this.error = e.message;
        this.loading = false;
      }
    });
  }

  private typewriter(text: string): void {
    let i = 0;
    this.typingText = '';
    const step = () => {
      if (i <= text.length) {
        this.typingText = text.slice(0, i);
        i += 3;
        setTimeout(step, 8);
      }
    };
    step();
  }
}
