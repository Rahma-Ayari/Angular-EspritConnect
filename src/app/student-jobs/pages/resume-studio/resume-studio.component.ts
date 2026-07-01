import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StudentAiService } from '../../services/student-ai.service';
import { ResumeStorageService } from '../../services/resume-storage.service';
import { ResumeTemplateService } from '../../services/resume-template.service';
import { StudentContextService } from '../../services/student-context.service';
import {
  RESUME_TEMPLATE,
  ResumeData,
  StudentResumeReviewResult,
  StudentResumeOptimizerResult
} from '../../models/student-ai.model';
import { JobOffer } from '../../../jobs/models/job.model';
import { StudentJobsBrowseService } from '../../services/student-jobs-browse.service';

@Component({
  selector: 'app-resume-studio',
  templateUrl: './resume-studio.component.html',
  styleUrls: ['./resume-studio.component.css']
})
export class ResumeStudioComponent implements OnInit {
  step = 1;
  resume!: ResumeData;
  template = RESUME_TEMPLATE;
  templatePreview = '/assets/resume-templates/science-engineering-preview.png';
  jobs: JobOffer[] = [];
  selectedJobId?: number;

  importLoading = false;
  reviewLoading = false;
  optimizeLoading = false;
  reviewResult?: StudentResumeReviewResult;
  optimizeResult?: StudentResumeOptimizerResult;
  aiError = '';
  aiProvider = '';
  dragIndex = -1;

  constructor(
    private resumeStorage: ResumeStorageService,
    private resumeTemplate: ResumeTemplateService,
    private studentAi: StudentAiService,
    private studentContext: StudentContextService,
    private browse: StudentJobsBrowseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const saved = this.resumeStorage.load();
    this.studentContext.getProfile().subscribe((p) => {
      this.resume = saved || this.resumeStorage.createEmpty(p.nom, p.email);
      this.resume.templateId = this.template.id;
      this.resumeStorage.save(this.resume);
    });
    this.browse.search({ limit: 30, page: 1 }).subscribe((r) => (this.jobs = r.data));
  }

  get plainText(): string {
    return this.resumeStorage.toPlainText(this.resume);
  }

  get previewHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.resumeTemplate.buildHtml(this.resume, true));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.importLoading = true;
    this.aiError = '';

    const isText = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
    if (isText) {
      const reader = new FileReader();
      reader.onload = () => {
        this.runReview(String(reader.result || ''), true);
        input.value = '';
      };
      reader.onerror = () => {
        this.importLoading = false;
        this.aiError = 'Could not read file. Try a PDF, DOCX, or paste content.';
      };
      reader.readAsText(file);
      return;
    }

    this.studentAi.extractResume(file).subscribe({
      next: (res) => {
        input.value = '';
        if (!res.text?.trim()) {
          this.importLoading = false;
          this.aiError = 'No readable text found in this file. It may be a scanned image.';
          return;
        }
        this.runReview(res.text, true);
      },
      error: (e) => {
        this.importLoading = false;
        this.aiError = e.message;
        input.value = '';
      }
    });
  }

  runReview(text?: string, fromImport = false): void {
    const resumeText = text || this.plainText;
    if (!resumeText.trim()) {
      this.aiError = 'Add resume content first.';
      return;
    }
    if (fromImport) {
      this.resume = this.resumeStorage.populateFromRawText(this.resume, resumeText);
      this.resume.templateId = this.template.id;
      this.resumeStorage.save(this.resume);
      this.step = 2;
    }
    this.reviewLoading = true;
    this.aiError = '';
    this.studentAi.reviewResume(resumeText).subscribe({
      next: (r) => {
        this.reviewResult = r;
        this.aiProvider = r.provider || '';
        this.reviewLoading = false;
        this.importLoading = false;
      },
      error: (e) => {
        this.aiError = e.message;
        this.reviewLoading = false;
        this.importLoading = false;
      }
    });
  }

  optimizeForJob(): void {
    if (!this.selectedJobId) return;
    this.optimizeLoading = true;
    this.aiError = '';
    this.studentAi.optimizeResume(this.selectedJobId, this.plainText).subscribe({
      next: (r) => {
        this.optimizeResult = r as any;
        this.aiProvider = r.provider || '';
        this.optimizeLoading = false;
      },
      error: (e) => {
        this.aiError = e.message;
        this.optimizeLoading = false;
      }
    });
  }

  continueToEditor(): void {
    this.resume.templateId = this.template.id;
    this.resumeStorage.save(this.resume);
    this.step = 3;
  }

  saveSection(): void {
    this.resumeStorage.save(this.resume);
  }

  onDragStart(i: number): void {
    this.dragIndex = i;
  }

  onDrop(i: number): void {
    if (this.dragIndex < 0 || this.dragIndex === i) return;
    const sections = [...this.resume.sections].sort((a, b) => a.order - b.order);
    const [moved] = sections.splice(this.dragIndex, 1);
    sections.splice(i, 0, moved);
    sections.forEach((s, idx) => (s.order = idx));
    this.resume.sections = sections;
    this.dragIndex = -1;
    this.resumeStorage.save(this.resume);
  }

  exportPdf(): void {
    this.resumeTemplate.exportPdf(this.resume);
  }

  exportDocx(): void {
    this.resumeTemplate.exportDocx(this.resume);
  }

  acceptOptimization(): void {
    if (!this.optimizeResult) return;
    const summary = this.optimizeResult.optimizedSummary;
    if (summary) {
      const sec = this.resume.sections.find((s) => s.type === 'experience');
      if (sec && !sec.content?.trim()) {
        sec.content = summary;
      }
    }
    const bullets = this.optimizeResult.improvedBulletPoints;
    if (bullets?.length) {
      const sec = this.resume.sections.find((s) => s.type === 'experience');
      if (sec) sec.content = bullets.map((b) => `• ${b}`).join('\n');
    }
    this.resumeStorage.save(this.resume);
  }

  sortedSections() {
    return [...this.resume.sections].sort((a, b) => a.order - b.order);
  }
}
