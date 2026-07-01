import { Injectable } from '@angular/core';
import { ResumeData, ResumeSection, RESUME_TEMPLATE } from '../models/student-ai.model';

@Injectable({ providedIn: 'root' })
export class ResumeTemplateService {
  readonly template = RESUME_TEMPLATE;
  readonly previewImage = '/assets/resume-templates/science-engineering-preview.png';
  readonly pdfAsset = '/assets/resume-templates/science-engineering-resume.pdf';

  exportPdf(resume: ResumeData): void {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(this.buildPrintDocument(resume));
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  exportDocx(resume: ResumeData): void {
    const html = this.buildHtml(resume);
    const blob = new Blob(
      [`\ufeff<html><head><meta charset="utf-8"></head><body>${html}</body></html>`],
      { type: 'application/msword' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${this.safeFileName(resume.fullName)}-resume.doc`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  buildHtml(resume: ResumeData, includeStyles = false): string {
    const contact = this.contactBlock(resume);
    const sections = this.sortedSections(resume)
      .filter((s) => s.content?.trim())
      .map((s) => this.sectionBlock(s))
      .join('');

    const body = `
      <div class="resume-page">
        <header class="resume-header">
          <h1>${this.esc(resume.fullName || 'Your Name')}</h1>
          <p class="headline">${this.esc(resume.jobTitle || 'Student')}</p>
        </header>
        ${contact}
        ${sections}
      </div>
    `;

    if (!includeStyles) return body;
    return `<style>${this.styles(true)}</style>${body}`;
  }

  private buildPrintDocument(resume: ResumeData): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${this.esc(resume.fullName || 'Resume')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Montserrat:wght@400;700;800&display=swap" rel="stylesheet" />
  <style>${this.styles()}</style>
</head>
<body>${this.buildHtml(resume)}</body>
</html>`;
  }

  private contactBlock(resume: ResumeData): string {
    const rows = [
      resume.phone ? `<div><strong>Phone:</strong> ${this.esc(resume.phone)}</div>` : '',
      resume.email ? `<div><strong>Email:</strong> ${this.esc(resume.email)}</div>` : '',
      resume.address ? `<div><strong>Address:</strong> ${this.esc(resume.address)}</div>` : '',
      resume.portfolio ? `<div><strong>Portfolio:</strong> ${this.esc(resume.portfolio)}</div>` : ''
    ].filter(Boolean);

    if (!rows.length) return '';

    return `
      <section class="resume-section">
        <div class="section-grid">
          <h2>Contact</h2>
          <div class="section-body contact-grid">${rows.join('')}</div>
        </div>
        <hr />
      </section>
    `;
  }

  private sectionBlock(section: ResumeSection): string {
    const label = this.sectionLabel(section);
    const body = this.formatSectionContent(section.content);

    return `
      <section class="resume-section">
        <div class="section-grid">
          <h2>${this.esc(label)}</h2>
          <div class="section-body">${body}</div>
        </div>
        <hr />
      </section>
    `;
  }

  private sectionLabel(section: ResumeSection): string {
    const map: Record<ResumeSection['type'], string> = {
      summary: 'Summary',
      experience: 'Professional Experience',
      education: 'Education',
      projects: 'Projects',
      skills: 'Skills',
      languages: 'Languages',
      certificates: 'Certificates'
    };
    return map[section.type] || section.title;
  }

  private formatSectionContent(content: string): string {
    const blocks = content.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    if (!blocks.length) return '';

    return blocks
      .map((block) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        const bullets = lines.filter((l) => /^[•\-\*]/.test(l));
        const nonBullets = lines.filter((l) => !/^[•\-\*]/.test(l));

        let html = '';
        if (nonBullets.length) {
          const [first, ...rest] = nonBullets;
          const isTitle = first.includes('|') || rest.length > 0;
          if (isTitle) {
            html += `<div class="entry-title">${this.esc(first)}</div>`;
            rest.forEach((line) => {
              html += `<div class="entry-sub">${this.esc(line)}</div>`;
            });
          } else {
            nonBullets.forEach((line) => {
              html += `<p>${this.esc(line)}</p>`;
            });
          }
        }

        if (bullets.length) {
          html += `<ul>${bullets.map((b) => `<li>${this.esc(b.replace(/^[•\-\*]\s*/, ''))}</li>`).join('')}</ul>`;
        } else if (nonBullets.length === 1 && !nonBullets[0].includes('|')) {
          // single line without structure
        }

        return `<div class="entry">${html}</div>`;
      })
      .join('');
  }

  private sortedSections(resume: ResumeData): ResumeSection[] {
    const order: ResumeSection['type'][] = [
      'experience',
      'education',
      'projects',
      'skills',
      'certificates',
      'languages'
    ];
    return [...resume.sections].sort(
      (a, b) => order.indexOf(a.type) - order.indexOf(b.type) || a.order - b.order
    );
  }

  private styles(compact = false): string {
    const pageWidth = compact ? '100%' : '210mm';
    const pagePadding = compact ? '1.25rem' : '14mm 12mm 16mm';
    const nameSize = compact ? '1.35rem' : '23pt';
    const headlineSize = compact ? '0.85rem' : '12pt';
    const baseSize = compact ? '0.72rem' : '10pt';

    return `
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #fff;
        color: #111;
        font-family: 'DM Sans', Arial, sans-serif;
        font-size: ${baseSize};
        line-height: 1.45;
      }
      .resume-page {
        width: ${pageWidth};
        min-height: ${compact ? 'auto' : '297mm'};
        margin: 0 auto;
        padding: ${pagePadding};
        background: #fff;
      }
      .resume-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1.6rem;
      }
      .resume-header h1 {
        margin: 0;
        font-family: 'Montserrat', Arial, sans-serif;
        font-size: ${nameSize};
        font-weight: 800;
        letter-spacing: -0.02em;
        line-height: 1.1;
      }
      .headline {
        margin: 0.15rem 0 0;
        font-family: 'Montserrat', Arial, sans-serif;
        font-size: ${headlineSize};
        font-weight: 400;
        text-align: right;
        white-space: nowrap;
      }
      .resume-section { margin-bottom: 0.35rem; }
      .section-grid {
        display: grid;
        grid-template-columns: 28% 1fr;
        gap: 1rem 1.25rem;
        align-items: start;
      }
      .section-grid h2 {
        margin: 0;
        font-size: 8.5pt;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .section-body { min-width: 0; }
      .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.2rem 1.5rem;
      }
      .contact-grid strong { font-weight: 700; }
      hr {
        border: 0;
        border-top: 1px solid #111;
        margin: 0.85rem 0 0.35rem;
      }
      .entry { margin-bottom: 0.85rem; }
      .entry:last-child { margin-bottom: 0; }
      .entry-title {
        font-weight: 700;
        margin-bottom: 0.15rem;
      }
      .entry-sub {
        margin-bottom: 0.35rem;
      }
      ul {
        margin: 0.2rem 0 0;
        padding-left: 1.1rem;
      }
      li { margin-bottom: 0.2rem; }
      p { margin: 0 0 0.35rem; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .resume-page { width: auto; min-height: auto; margin: 0; padding: 14mm 12mm; }
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
    return (name || 'resume').trim().replace(/[^\w\-]+/g, '-').replace(/-+/g, '-');
  }
}
