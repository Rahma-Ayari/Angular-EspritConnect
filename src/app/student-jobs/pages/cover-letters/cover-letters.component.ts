import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { StudentAiService } from '../../services/student-ai.service';
import { CoverLetterTemplateService } from '../../services/cover-letter-template.service';
import { StudentContextService } from '../../services/student-context.service';
import { StudentJobsBrowseService } from '../../services/student-jobs-browse.service';
import { COVER_LETTER_TEMPLATE, CoverLetterData, StudentCoverLetterResult } from '../../models/student-ai.model';
import { JobOffer } from '../../../jobs/models/job.model';

@Component({
  selector: 'app-cover-letters',
  templateUrl: './cover-letters.component.html',
  styleUrls: ['./cover-letters.component.css']
})
export class CoverLettersComponent implements OnInit {
  step = 1;
  template = COVER_LETTER_TEMPLATE;
  templatePreview = '/assets/cover-letter-templates/minimalist-cover-letter-preview.png';
  jobs: JobOffer[] = [];
  selectedJobId?: number;

  data: CoverLetterData = this.emptyData();
  loading = false;
  error = '';
  provider = '';
  result?: StudentCoverLetterResult;

  constructor(
    private studentAi: StudentAiService,
    private coverLetterTemplate: CoverLetterTemplateService,
    private studentContext: StudentContextService,
    private browse: StudentJobsBrowseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.studentContext.getProfile().subscribe((p) => {
      this.data.fullName = p.nom || '';
      this.data.email = p.email || '';
      this.data.studentTitle = p.filiere ? `${p.filiere} Student` : 'Student';
    });
    this.browse.search({ limit: 30, page: 1 }).subscribe((r) => (this.jobs = r.data));
  }

  get hasLetter(): boolean {
    return !!this.data.letterBody?.trim();
  }

  get previewHtml(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.coverLetterTemplate.buildHtml(this.data, true));
  }

  onJobSelected(): void {
    const job = this.jobs.find((j) => j.id === this.selectedJobId);
    if (!job) return;
    this.data.jobTitle = job.title || '';
    this.data.companyName = job.companyName || '';
  }

  generate(): void {
    if (!this.data.jobTitle.trim()) {
      this.error = 'Job title is required — select a job or enter one manually.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.studentAi.generateCoverLetter({
      offreId: this.selectedJobId,
      jobTitle: this.data.jobTitle,
      companyName: this.data.companyName,
      templateStyle: this.template.id,
      additionalNotes: this.data.additionalNotes
    }).subscribe({
      next: (r) => {
        this.result = r;
        this.provider = r.provider || '';
        this.data.letterBody = r.letter;
        const parsed = this.coverLetterTemplate.parseLetter(r.letter);
        if (parsed.salutation) this.data.salutation = parsed.salutation;
        if (parsed.closing) this.data.closing = parsed.closing;
        this.step = 3;
        this.loading = false;
      },
      error: (e) => {
        this.error = e.message;
        this.loading = false;
      }
    });
  }

  regenerate(): void {
    this.generate();
  }

  exportPdf(): void {
    this.coverLetterTemplate.exportPdf(this.data);
  }

  exportDocx(): void {
    this.coverLetterTemplate.exportDocx(this.data);
  }

  continueToDetails(): void {
    this.step = 2;
  }

  private emptyData(): CoverLetterData {
    return {
      fullName: '',
      studentTitle: '',
      email: '',
      phone: '',
      address: '',
      jobTitle: '',
      companyName: '',
      salutation: 'To whom it may concern,',
      closing: 'Yours sincerely,',
      letterBody: '',
      additionalNotes: ''
    };
  }
}
