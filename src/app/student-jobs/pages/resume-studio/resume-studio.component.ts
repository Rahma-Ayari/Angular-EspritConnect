import { Component, OnInit } from '@angular/core';
import { StudentAiService } from '../../services/student-ai.service';
import { ResumeStorageService } from '../../services/resume-storage.service';
import { StudentContextService } from '../../services/student-context.service';
import {
  RESUME_TEMPLATES,
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
  templates = RESUME_TEMPLATES;
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
    private studentAi: StudentAiService,
    private studentContext: StudentContextService,
    private browse: StudentJobsBrowseService
  ) {}

  ngOnInit(): void {
    const saved = this.resumeStorage.load();
    this.studentContext.getProfile().subscribe((p) => {
      this.resume = saved || this.resumeStorage.createEmpty(p.nom, p.email);
    });
    this.browse.search({ limit: 30, page: 1 }).subscribe((r) => (this.jobs = r.data));
  }

  get plainText(): string {
    return this.resumeStorage.toPlainText(this.resume);
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

    // PDF / DOCX → extract real text on the backend
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
    // On import, fill the editor with the actual CV content immediately.
    if (fromImport) {
      this.resume = this.resumeStorage.populateFromRawText(this.resume, resumeText);
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

  selectTemplate(id: string): void {
    this.resume.templateId = id;
    this.resumeStorage.save(this.resume);
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
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<pre style="font-family:Arial,sans-serif;padding:24px;white-space:pre-wrap">${this.escapeHtml(this.plainText)}</pre>`);
    w.document.close();
    w.print();
  }

  exportDocx(): void {
    const blob = new Blob([this.plainText], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'resume.doc';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  acceptOptimization(): void {
    if (!this.optimizeResult) return;
    const summary = this.optimizeResult.optimizedSummary;
    if (summary) {
      const sec = this.resume.sections.find((s) => s.type === 'summary');
      if (sec) sec.content = summary;
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

  private escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
