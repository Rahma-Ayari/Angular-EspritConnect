import { Injectable } from '@angular/core';
import { ResumeData, ResumeSection } from '../models/student-ai.model';

const STORAGE_KEY = 'esprit_student_resume';

@Injectable({ providedIn: 'root' })
export class ResumeStorageService {
  load(): ResumeData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? this.normalize(JSON.parse(raw) as ResumeData) : null;
    } catch {
      return null;
    }
  }

  save(data: ResumeData): void {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  createEmpty(fullName = '', email = ''): ResumeData {
    return {
      templateId: 'science-engineering',
      fullName,
      jobTitle: '',
      email,
      phone: '',
      address: '',
      portfolio: '',
      sections: [
        this.section('education', 'Education', '', 0),
        this.section('experience', 'Professional Experience', '', 1),
        this.section('projects', 'Projects', '', 2),
        this.section('skills', 'Skills', '', 3),
        this.section('certificates', 'Certificates', '', 4),
        this.section('languages', 'Languages', '', 5)
      ]
    };
  }

  /** Backfill fields added after older saves were stored in localStorage. */
  normalize(data: ResumeData): ResumeData {
    return {
      templateId: data.templateId || 'science-engineering',
      fullName: data.fullName || '',
      jobTitle: data.jobTitle || '',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      portfolio: data.portfolio || '',
      sections: data.sections?.length ? data.sections : this.createEmpty().sections,
      lastUpdated: data.lastUpdated
    };
  }

  toPlainText(data: ResumeData): string {
    const header = [data.fullName, data.jobTitle].filter(Boolean).join(' — ');
    const contact = [data.email, data.phone, data.address, data.portfolio].filter(Boolean);
    const lines: string[] = [];
    if (header) lines.push(header);
    if (contact.length) lines.push(contact.join(' | '));
    lines.push('');
    const sorted = [...data.sections].sort((a, b) => a.order - b.order);
    for (const s of sorted) {
      if (!s.content?.trim()) continue;
      lines.push(s.title.toUpperCase());
      lines.push(s.content.trim());
      lines.push('');
    }
    return lines.join('\n');
  }

  applyExtraction(data: ResumeData, extracted: {
    extractedSkills?: string[];
    extractedExperience?: string[];
    extractedEducation?: string[];
  }): ResumeData {
    const next = { ...data, sections: data.sections.map((s) => ({ ...s })) };
    if (extracted.extractedEducation?.length) {
      this.setSectionContent(next, 'education', extracted.extractedEducation.join('\n'));
    }
    if (extracted.extractedExperience?.length) {
      this.setSectionContent(next, 'experience', extracted.extractedExperience.join('\n'));
    }
    if (extracted.extractedSkills?.length) {
      this.setSectionContent(next, 'skills', extracted.extractedSkills.join(', '));
    }
    return next;
  }

  /**
   * Parse raw extracted resume text into structured sections by detecting common headers.
   * Anything before the first known header becomes the summary.
   */
  populateFromRawText(data: ResumeData, rawText: string): ResumeData {
    const next = { ...data, sections: data.sections.map((s) => ({ ...s })) };
    if (!rawText?.trim()) return next;

    const headerMap: { type: ResumeSection['type']; patterns: RegExp }[] = [
      { type: 'education', patterns: /^(education|formation|études|academic)/i },
      { type: 'experience', patterns: /^(experience|work experience|professional|employment|expérience)/i },
      { type: 'projects', patterns: /^(projects|projets|personal projects)/i },
      { type: 'skills', patterns: /^(skills|technical skills|compétences|technologies)/i },
      { type: 'languages', patterns: /^(languages|langues|language)/i },
      { type: 'certificates', patterns: /^(certifications?|certificates?|certificat)/i }
    ];

    const lines = rawText.split('\n');
    const buckets: Record<string, string[]> = { summary: [] };
    let current = 'summary';

    for (const line of lines) {
      const trimmed = line.trim();
      const match = headerMap.find((h) => h.patterns.test(trimmed) && trimmed.length < 40);
      if (match) {
        current = match.type;
        if (!buckets[current]) buckets[current] = [];
        continue;
      }
      if (!buckets[current]) buckets[current] = [];
      buckets[current].push(line);
    }

    for (const [type, content] of Object.entries(buckets)) {
      const text = content.join('\n').replace(/\n{3,}/g, '\n\n').trim();
      if (!text) continue;
      const sec = next.sections.find((s) => s.type === type);
      if (sec) {
        sec.content = text;
      }
    }
    return next;
  }

  private setSectionContent(data: ResumeData, type: ResumeSection['type'], content: string): void {
    const sec = data.sections.find((s) => s.type === type);
    if (sec && !sec.content?.trim()) sec.content = content;
  }

  private section(type: ResumeSection['type'], title: string, content: string, order: number): ResumeSection {
    return { id: `${type}-${order}`, type, title, content, order };
  }
}
