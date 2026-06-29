import { Component, OnInit } from '@angular/core';
import { StudentAiService } from '../../services/student-ai.service';
import { COVER_LETTER_TEMPLATES, StudentCoverLetterResult } from '../../models/student-ai.model';

@Component({
  selector: 'app-cover-letters',
  templateUrl: './cover-letters.component.html',
  styleUrls: ['./cover-letters.component.css']
})
export class CoverLettersComponent {
  step = 1;
  templates = COVER_LETTER_TEMPLATES;
  selectedTemplate = 'professional';
  jobTitle = '';
  companyName = '';
  additionalNotes = '';
  letter = '';
  typingLetter = '';
  loading = false;
  error = '';
  provider = '';
  result?: StudentCoverLetterResult;

  constructor(private studentAi: StudentAiService) {}

  selectTemplate(id: string): void {
    this.selectedTemplate = id;
    this.step = 2;
  }

  generate(): void {
    if (!this.jobTitle.trim()) {
      this.error = 'Job title is required.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.typingLetter = '';
    this.studentAi.generateCoverLetter({
      jobTitle: this.jobTitle,
      companyName: this.companyName,
      templateStyle: this.selectedTemplate,
      additionalNotes: this.additionalNotes
    }).subscribe({
      next: (r) => {
        this.result = r;
        this.provider = r.provider || '';
        this.letter = r.letter;
        this.step = 3;
        this.typewriter(r.letter);
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
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<pre style="font-family:Georgia,serif;padding:40px;white-space:pre-wrap;line-height:1.6">${this.letter.replace(/</g, '&lt;')}</pre>`);
    w.document.close();
    w.print();
  }

  exportDocx(): void {
    const blob = new Blob([this.letter], { type: 'application/msword' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cover-letter-${this.companyName || 'job'}.doc`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  private typewriter(text: string): void {
    let i = 0;
    const step = () => {
      if (i <= text.length) {
        this.typingLetter = text.slice(0, i);
        i += 4;
        setTimeout(step, 10);
      }
    };
    step();
  }
}
