import { Injectable } from '@angular/core';
import { CoverLetterData, COVER_LETTER_TEMPLATE } from '../models/student-ai.model';

@Injectable({ providedIn: 'root' })
export class CoverLetterTemplateService {
  readonly template = COVER_LETTER_TEMPLATE;
  readonly previewImage = '/assets/cover-letter-templates/minimalist-cover-letter-preview.png';

  exportPdf(data: CoverLetterData): void {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(this.buildPrintDocument(data));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  exportDocx(data: CoverLetterData): void {
    const html = this.buildHtml(data);
    const blob = new Blob(
      [`\ufeff<html><head><meta charset="utf-8"></head><body>${html}</body></html>`],
      { type: 'application/msword' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${this.safeFileName(data.companyName || data.jobTitle)}-cover-letter.doc`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  buildHtml(data: CoverLetterData, includeStyles = false): string {
    const parsed = this.parseLetter(data.letterBody);
    const salutation = data.salutation || parsed.salutation || 'To whom it may concern,';
    const closing = data.closing || parsed.closing || 'Yours sincerely,';
    const paragraphs = parsed.paragraphs.length ? parsed.paragraphs : [data.letterBody].filter(Boolean);

    const contactItems = [
      data.email
        ? `<div class="contact-item"><span class="icon" aria-hidden="true">&#9993;</span><span>${this.esc(data.email)}</span></div>`
        : '',
      data.phone
        ? `<div class="contact-item"><span class="icon" aria-hidden="true">&#9742;</span><span>${this.esc(data.phone)}</span></div>`
        : '',
      data.address
        ? `<div class="contact-item"><span class="icon" aria-hidden="true">&#9906;</span><span>${this.esc(data.address)}</span></div>`
        : ''
    ].filter(Boolean);

    const body = `
      <div class="cover-letter-page">
        <div class="top-rule"></div>
        <header class="cl-header">
          <div class="identity">
            <h1>${this.esc(data.fullName || 'Your Name')}</h1>
            <p class="student-title">${this.esc(data.studentTitle || 'Student')}</p>
          </div>
          <div class="contact">${contactItems.join('')}</div>
        </header>
        <div class="header-bar"></div>
        <div class="letter-body">
          <p class="salutation">${this.esc(salutation)}</p>
          ${paragraphs.map((p) => `<p>${this.esc(p)}</p>`).join('')}
          <p class="closing">${this.esc(closing)}</p>
          <p class="signature">${this.esc(data.fullName || '')}</p>
        </div>
        <div class="bottom-rule"></div>
      </div>
    `;

    if (!includeStyles) return body;
    return `<style>${this.styles(true)}</style>${body}`;
  }

  /** Split AI-generated letter into salutation, paragraphs, and closing. */
  parseLetter(raw: string): { salutation: string; paragraphs: string[]; closing: string } {
    const text = (raw || '').trim();
    if (!text) return { salutation: '', paragraphs: [], closing: '' };

    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    let salutation = '';
    let closing = '';

    const salutationRe = /^(dear|to whom|hello|hi)\b/i;
    const closingRe = /^(sincerely|yours|best regards|kind regards|warm regards|respectfully|thank you)/i;

    if (lines.length && salutationRe.test(lines[0])) {
      salutation = lines.shift()!;
      if (!salutation.endsWith(',')) salutation += ',';
    }

    while (lines.length && closingRe.test(lines[lines.length - 1])) {
      closing = lines.pop()!;
      if (!closing.endsWith(',')) closing += ',';
    }

    if (lines.length && /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(lines[lines.length - 1])) {
      lines.pop();
    }

    const bodyText = lines.join('\n\n');
    const paragraphs = bodyText
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\n/g, ' ').trim())
      .filter(Boolean);

    return { salutation, paragraphs, closing };
  }

  private buildPrintDocument(data: CoverLetterData): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${this.esc(data.fullName || 'Cover Letter')} — ${this.esc(data.companyName || data.jobTitle || 'Application')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Montserrat:wght@400;500&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
  <style>${this.styles()}</style>
</head>
<body>${this.buildHtml(data)}</body>
</html>`;
  }

  private styles(compact = false): string {
    const pagePadding = compact ? '1.25rem' : '18mm 16mm 20mm';
    const nameSize = compact ? '1.65rem' : '37pt';
    const bodySize = compact ? '0.78rem' : '11pt';

    return `
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #fff;
        color: #111;
        font-family: 'Montserrat', Arial, sans-serif;
        font-size: ${bodySize};
        line-height: 1.55;
      }
      .cover-letter-page {
        width: ${compact ? '100%' : '210mm'};
        min-height: ${compact ? 'auto' : '297mm'};
        margin: 0 auto;
        padding: ${pagePadding};
        background: #fff;
        display: flex;
        flex-direction: column;
      }
      .top-rule,
      .bottom-rule {
        height: 1px;
        background: #111;
        width: 100%;
      }
      .bottom-rule { margin-top: auto; }
      .cl-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1.5rem;
        padding: 1rem 0 0.85rem;
      }
      .identity h1 {
        margin: 0;
        font-family: 'Playfair Display', Georgia, serif;
        font-size: ${nameSize};
        font-weight: 700;
        line-height: 1.05;
        letter-spacing: -0.01em;
      }
      .student-title {
        margin: 0.35rem 0 0;
        font-size: ${compact ? '0.72rem' : '10pt'};
        letter-spacing: 0.02em;
      }
      .contact {
        text-align: left;
        font-size: ${compact ? '0.68rem' : '10pt'};
        line-height: 1.5;
        min-width: 180px;
      }
      .contact-item {
        display: flex;
        align-items: flex-start;
        gap: 0.45rem;
        margin-bottom: 0.2rem;
      }
      .contact-item .icon {
        width: 14px;
        flex-shrink: 0;
        font-size: 0.85em;
        line-height: 1.5;
      }
      .header-bar {
        height: 5px;
        background: #111;
        width: 100%;
        margin-bottom: 1.5rem;
      }
      .letter-body {
        flex: 1;
        text-align: justify;
      }
      .letter-body p {
        margin: 0 0 0.95rem;
      }
      .salutation {
        margin-bottom: 1rem !important;
      }
      .closing {
        margin-top: 1.25rem !important;
        margin-bottom: 0.75rem !important;
        text-align: left;
      }
      .signature {
        font-family: 'Dancing Script', cursive;
        font-size: ${compact ? '1.6rem' : '32pt'};
        font-weight: 700;
        margin: 0 0 2rem !important;
        text-align: left;
      }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .cover-letter-page { width: auto; min-height: auto; }
      }
    `;
  }

  private esc(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private safeFileName(name: string): string {
    return (name || 'cover-letter').trim().replace(/[^\w\-]+/g, '-').replace(/-+/g, '-');
  }
}
